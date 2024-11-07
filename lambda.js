// Lambda function code for the /user endpoint using AWS SDK v3

import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  TransactWriteCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import crypto from "crypto";

// Initialize DynamoDB client
const dynamoDBClient = new DynamoDBClient({});
const dynamodb = DynamoDBDocumentClient.from(dynamoDBClient);

const MAX_SIZE = 1000;

export const handler = async (event) => {
  try {
    const body =
      typeof event === "object" && typeof event.body === "undefined"
        ? event
        : JSON.parse(event.body);
    const initData = body.initData;

    if (!initData) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Invalid Telegram initData" }),
      };
    }

    const action = body.action || "get";
    const botToken = process.env.BOT_TOKEN;

    // Validate Telegram data
    const isValid = validateTelegramData(initData, botToken);

    if (!isValid) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: "Invalid Telegram data" }),
      };
    }

    // Extract user data
    const params = new URLSearchParams(initData);
    const userDataStr = params.get("user");
    const userData = JSON.parse(userDataStr);
    const startParam = params.get("start_param");
    const userId = userData.id.toString();

    // Handle actions
    switch (action) {
      case "get":
        return await handleGetRequest(userId, userData, startParam);
      case "move":
        return await handleMoveRequest(userId, body.position);
      case "pickup":
        return await handlePickupRequest(userId);
      case "finish":
        return await handleFinishRequest(userId);
      case "update":
        return await handleUpdateUser(userId, body.updateData);
      case "ref":
        return await handleGetReferrals(userId);
      default:
        return {
          statusCode: 400,
          body: JSON.stringify({ error: "Invalid action" }),
        };
    }
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Internal Server Error" }),
    };
  }
};

// 1. Validate Telegram Data

function validateTelegramData(telegramInitData, botToken) {
  const initData = new URLSearchParams(telegramInitData);
  const hash = initData.get("hash");
  const dataToCheck = [];

  initData.sort();
  initData.forEach(
    (val, key) => key !== "hash" && dataToCheck.push(`${key}=${val}`)
  );

  const secret = crypto
    .createHmac("sha256", "WebAppData")
    .update(botToken)
    .digest();

  const _hash = crypto
    .createHmac("sha256", secret)
    .update(dataToCheck.join("\n"))
    .digest("hex");

  return hash === _hash;
}

// 2. User Registration and Retrieval

async function getUser(userId) {
  const params = {
    TableName: "User",
    Key: { userId },
  };
  const command = new GetCommand(params);
  const result = await dynamodb.send(command);
  return result.Item;
}

async function createUser(userData, inviterId) {
  // Construct the user item without inviterId
  const userItem = {
    userId: userData.id.toString(),
    isBot: userData.is_bot || false,
    firstName: userData.first_name,
    lastName: userData.last_name || "",
    username: userData.username || "",
    languageCode: userData.language_code || "",
    isPremium: userData.is_premium || false,
    addedToAttachmentMenu: userData.added_to_attachment_menu || false,
    allowsWriteToPm: userData.allows_write_to_pm || false,
    photoUrl: userData.photo_url || "",
    tonAddress: "", // User can update this later
    score: 0,
    blockedUntil: 0,
    blockDuration: 0,
  };

  // Add inviterId only if it's not null or undefined
  if (inviterId) {
    userItem.inviterId = inviterId;
  }

  const params = {
    TableName: "User",
    Item: userItem,
  };

  const command = new PutCommand(params);
  await dynamodb.send(command);
}

async function updateUser(userId, updateData) {
  // updateData is an object with fields to update
  const updateExpressions = [];
  const expressionAttributeValues = {};
  const expressionAttributeNames = {};

  for (const [key, value] of Object.entries(updateData)) {
    updateExpressions.push(`#${key} = :${key}`);
    expressionAttributeValues[`:${key}`] = value;
    expressionAttributeNames[`#${key}`] = key;
  }

  const params = {
    TableName: "User",
    Key: { userId },
    UpdateExpression: "SET " + updateExpressions.join(", "),
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
  };

  const command = new UpdateCommand(params);
  await dynamodb.send(command);
}

// 3. Maze Generation and Retrieval

async function getCurrentMaze(userId) {
  // Query the Maze table for the latest maze for this user that is not marked as passed
  const params = {
    TableName: "Maze",
    IndexName: "UserIdIndex", // Assuming we have a GSI on userId
    KeyConditionExpression: "userId = :userId",
    FilterExpression: "attribute_not_exists(passed) OR passed = :false",
    ExpressionAttributeValues: {
      ":userId": userId,
      ":false": false,
    },
    Limit: 1,
    ScanIndexForward: false, // Get the latest maze
  };
  const command = new QueryCommand(params);
  const result = await dynamodb.send(command);
  return result.Items && result.Items[0];
}

async function saveMaze(maze) {
  const params = {
    TableName: "Maze",
    Item: maze,
  };
  const command = new PutCommand(params);
  await dynamodb.send(command);
}

function generateMazeForUser(user) {
  // Determine maze size
  const prevMazeSize = user.lastMazeSize || { width: 1, height: 1 };
  let mazeSize = { ...prevMazeSize };

  // Increase one side randomly
  if (mazeSize.width < MAX_SIZE && mazeSize.height < MAX_SIZE) {
    if (Math.random() < 0.5) {
      mazeSize.width += 1;
    } else {
      mazeSize.height += 1;
    }
  }

  // Generate maze matrix
  const mazeMatrix = generateMazeMatrix(mazeSize.width, mazeSize.height);

  // Generate colors
  const wallColor = getRandomColor(128);
  const floorColor = getRandomColor(128);
  const playerColor = getRandomColor(64);
  const portalColor = getRandomColor(64);

  // Find finish position
  const finishData = findFarthestPoint(
    mazeMatrix,
    0,
    mazeSize.height - 1,
    mazeSize
  );
  const finishPosition = { x: finishData.x, y: finishData.y };

  // Generate item if maze is large
  let item = null;
  if (mazeSize.width > 10 && mazeSize.height > 10) {
    item = generateRandomItem(
      mazeSize.width,
      mazeSize.height,
      [0, mazeSize.height - 1],
      [finishPosition.x, finishPosition.y]
    );
  }

  // Record start time and moves
  const startTime = Date.now();
  const numberOfMoves = finishData.distance;

  return {
    mazeId: crypto.randomUUID(), // Generate unique mazeId
    userId: user.userId,
    mazeSize,
    mazeMatrix,
    wallColor,
    floorColor,
    playerColor,
    portalColor,
    finishPosition,
    playerPosition: { x: 0, y: mazeSize.height - 1 },
    item,
    startTime,
    numberOfMoves,
    passed: false,
  };
}

// generateMazeMatrix function
function generateMazeMatrix(width, height) {
  // Implement the maze generation algorithm similar to the client code
  const maze = Array.from({ length: height }, (_, y) =>
    Array.from({ length: width }, (_, x) => ({
      x,
      y,
      walls: { top: true, right: true, bottom: true, left: true },
    }))
  );

  const stack = [[0, height - 1]];
  const visited = new Set();

  while (stack.length) {
    const [x, y] = stack[stack.length - 1];
    visited.add(`${x},${y}`);

    const neighbors = [
      [x, y - 1, "top", "bottom"],
      [x + 1, y, "right", "left"],
      [x, y + 1, "bottom", "top"],
      [x - 1, y, "left", "right"],
    ].filter(
      ([nx, ny]) =>
        nx >= 0 &&
        nx < width &&
        ny >= 0 &&
        ny < height &&
        !visited.has(`${nx},${ny}`)
    );

    if (neighbors.length) {
      const [nx, ny, wall1, wall2] =
        neighbors[Math.floor(Math.random() * neighbors.length)];
      maze[y][x].walls[wall1] = false;
      maze[ny][nx].walls[wall2] = false;
      stack.push([nx, ny]);
    } else {
      stack.pop();
    }
  }

  return maze;
}

// findFarthestPoint function
function findFarthestPoint(maze, startX, startY, mazeSize) {
  const queue = [[startX, startY, 0]];
  const visited = new Set();
  let farthest = { x: startX, y: startY, distance: 0 };

  while (queue.length) {
    const [x, y, distance] = queue.shift();
    const cell = maze[y][x];
    visited.add(`${x},${y}`);

    if (distance > farthest.distance) {
      farthest = { x, y, distance };
    }

    const directions = [
      [0, -1, "top"],
      [1, 0, "right"],
      [0, 1, "bottom"],
      [-1, 0, "left"],
    ];

    directions.forEach(([dx, dy, wall]) => {
      const nx = x + dx;
      const ny = y + dy;
      if (
        nx >= 0 &&
        nx < mazeSize.width &&
        ny >= 0 &&
        ny < mazeSize.height &&
        !visited.has(`${nx},${ny}`) &&
        !cell.walls[wall]
      ) {
        queue.push([nx, ny, distance + 1]);
      }
    });
  }

  return farthest; // Contains x, y, and distance
}

// generateRandomItem function
function generateRandomItem(width, height, startCoord, finishCoord) {
  let x, y;
  do {
    x = Math.floor(Math.random() * width);
    y = Math.floor(Math.random() * height);
  } while (
    (x === startCoord[0] && y === startCoord[1]) ||
    (x === finishCoord[0] && y === finishCoord[1])
  );

  const types = ["apple", "orange", "banana", "cherry"];
  const type = types[Math.floor(Math.random() * types.length)];

  return {
    x,
    y,
    type,
    picked: false,
  };
}

// getRandomColor function
function getRandomColor(plus) {
  const getRandomValue = () => Math.floor(Math.random() * 128) + plus;
  const r = getRandomValue();
  const g = getRandomValue();
  const b = getRandomValue();

  return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
}

// 4. Handle 'Get' Request

async function handleGetRequest(userId, userData, startParam) {
  let user = await getUser(userId);

  // If user doesn't exist, create one
  if (!user) {
    let inviterId = null;
    if (startParam && startParam.startsWith("ref-")) {
      inviterId = startParam.substring(4);
    }
    await createUser(userData, inviterId);
    user = await getUser(userId);
  }

  // Check if user is blocked
  if (Date.now() < user.blockedUntil) {
    const remainingTime = user.blockedUntil - Date.now();
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "User is blocked", remainingTime }),
    };
  }

  // Get current maze
  let maze;
  if (user.currentMazeId) {
    maze = await getMazeById(user.currentMazeId);
    if (!maze || maze.passed) {
      maze = null;
    }
  }

  if (!maze) {
    // Need to create a new maze
    maze = generateMazeForUser(user);

    // Use DynamoDB Transaction to atomically create maze and update user
    const params = {
      TransactItems: [
        {
          Put: {
            TableName: "Maze",
            Item: maze,
          },
        },
        {
          Update: {
            TableName: "User",
            Key: { userId },
            UpdateExpression: "SET currentMazeId = :mazeId",
            ExpressionAttributeValues: {
              ":mazeId": maze.mazeId,
            },
            ConditionExpression:
              "attribute_not_exists(currentMazeId) OR currentMazeId = :null",
            ExpressionAttributeValues: {
              ":mazeId": maze.mazeId,
              ":null": null,
            },
          },
        },
      ],
    };

    try {
      const command = new TransactWriteCommand(params);
      await dynamodb.send(command);
      user.currentMazeId = maze.mazeId;
    } catch (error) {
      if (error.name === "TransactionCanceledException") {
        // Another process created the maze; fetch the existing maze
        maze = await getMazeById(user.currentMazeId);
      } else {
        throw error;
      }
    }
  }

  // Respond with maze data
  return {
    statusCode: 200,
    body: JSON.stringify({
      mazeId: maze.mazeId,
      mazeSize: maze.mazeSize,
      mazeMatrix: maze.mazeMatrix,
      wallColor: maze.wallColor,
      floorColor: maze.floorColor,
      playerColor: maze.playerColor,
      portalColor: maze.portalColor,
      finishPosition: maze.finishPosition,
      playerPosition: maze.playerPosition,
      item: maze.item,
      score: user.score || 0,
      userData: {
        userId: user.userId,
        firstName: user.firstName,
        lastName: user.lastName,
        username: user.username,
        photoUrl: user.photoUrl,
        tonAddress: user.tonAddress,
        items: user.items || [],
      },
    }),
  };
}

async function getMazeById(mazeId) {
  const params = {
    TableName: "Maze",
    Key: { mazeId },
  };
  const command = new GetCommand(params);
  const result = await dynamodb.send(command);
  return result.Item;
}

// 5. Handle 'Move' Request

async function handleMoveRequest(userId, position) {
  const user = await getUser(userId);
  if (!user || !user.currentMazeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze not found" }),
    };
  }

  const maze = await getMazeById(user.currentMazeId);
  if (!maze || maze.passed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze By Id not found" }),
    };
  }

  // Validate the new position
  const { x, y } = position;
  if (x < 0 || x >= maze.mazeSize.width || y < 0 || y >= maze.mazeSize.height) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Invalid position" }),
    };
  }

  // Update player position
  maze.playerPosition = position;
  // Save updated maze
  await saveMaze(maze);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Position updated" }),
  };
}

// 6. Handle 'Pickup' Request

async function handlePickupRequest(userId) {
  const user = await getUser(userId);
  if (!user || !user.currentMazeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze not found" }),
    };
  }

  const maze = await getMazeById(user.currentMazeId);
  if (!maze || maze.passed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze not found" }),
    };
  }

  if (maze.item && !maze.item.picked) {
    const { x, y } = maze.playerPosition;
    if (x === maze.item.x && y === maze.item.y) {
      maze.item.picked = true;
      await saveMaze(maze);

      // Update user's items
      const userItems = user.items || [];
      userItems.push(maze.item.type);

      // Update user data
      await updateUser(userId, { items: userItems });

      return {
        statusCode: 200,
        body: JSON.stringify({ message: "Item picked", item: maze.item }),
      };
    }
  }

  return {
    statusCode: 400,
    body: JSON.stringify({ error: "No item to pick here" }),
  };
}

// 7. Handle 'Finish' Request and Fair Play

async function handleFinishRequest(userId) {
  const user = await getUser(userId);
  if (!user || !user.currentMazeId) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze not found" }),
    };
  }

  const maze = await getMazeById(user.currentMazeId);
  if (!maze) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze By Id not found" }),
    };
  }

  if (maze.passed) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Maze already passed" }),
    };
  }

  const endTime = Date.now();
  const actualTime = endTime - maze.startTime;
  const minTime = maze.numberOfMoves * 500; // 0.5 seconds per move

  if (actualTime < minTime) {
    // User is cheating
    await blockUser(userId, user.blockDuration);
    return {
      statusCode: 403,
      body: JSON.stringify({ error: "Cheating detected. User is blocked." }),
    };
  }

  // Update user's score and reset currentMazeId in a transaction
  const newScore =
    (user.score || 0) + maze.mazeSize.width * maze.mazeSize.height;

  const params = {
    TransactItems: [
      {
        Update: {
          TableName: "Maze",
          Key: { mazeId: maze.mazeId },
          UpdateExpression:
            "SET passed = :true, endTime = :endTime, timeToFinish = :timeToFinish",
          ExpressionAttributeValues: {
            ":true": true,
            ":endTime": endTime,
            ":timeToFinish": actualTime,
          },
        },
      },
      {
        Update: {
          TableName: "User",
          Key: { userId },
          UpdateExpression:
            "SET score = :score, lastMazeSize = :mazeSize, currentMazeId = :null",
          ExpressionAttributeValues: {
            ":score": newScore,
            ":mazeSize": maze.mazeSize,
            ":null": null,
          },
        },
      },
    ],
  };

  await dynamodb.send(new TransactWriteCommand(params));

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "Maze completed", newScore }),
  };
}

async function blockUser(userId, previousBlockDuration) {
  let newBlockDuration = previousBlockDuration
    ? previousBlockDuration * 2
    : 3600; // Start with 1 hour
  if (newBlockDuration > 86400) {
    newBlockDuration = 86400; // Max block duration is 24 hours
  }
  const unblockTime = Date.now() + newBlockDuration * 1000; // milliseconds

  const params = {
    TableName: "User",
    Key: { userId },
    UpdateExpression:
      "SET blockedUntil = :unblockTime, blockDuration = :blockDuration",
    ExpressionAttributeValues: {
      ":unblockTime": unblockTime,
      ":blockDuration": newBlockDuration,
    },
  };
  const command = new UpdateCommand(params);
  await dynamodb.send(command);
}

// 8. Handle 'Update' User Request

async function handleUpdateUser(userId, updateData) {
  await updateUser(userId, updateData);

  return {
    statusCode: 200,
    body: JSON.stringify({ message: "User updated" }),
  };
}

// 9. Handle 'Ref' Request to Get Referrals

async function handleGetReferrals(userId) {
  // Query users who have inviterId == userId
  const params = {
    TableName: "User",
    IndexName: "InviterIdIndex", // Assuming we have a GSI on inviterId
    KeyConditionExpression: "inviterId = :userId",
    ExpressionAttributeValues: {
      ":userId": userId,
    },
  };
  const command = new QueryCommand(params);
  const result = await dynamodb.send(command);

  const referrals = result.Items.map((item) => ({
    userId: item.userId,
    firstName: item.firstName,
    lastName: item.lastName,
    username: item.username,
  }));

  return {
    statusCode: 200,
    body: JSON.stringify({ referrals }),
  };
}

// --- End of Lambda Function Code ---
