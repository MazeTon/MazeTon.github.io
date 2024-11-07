# MazeTon: A Telegram WebApp 3D Maze Adventure 🌀

<div style="text-align:center" align="center">
    <img src="https://raw.githubusercontent.com/mazeton/mazeton.github.io/master/public/logo.png" width="400">
</div>

Welcome to **MazeTon**, an immersive 3D maze game built as a Telegram WebApp! Navigate through intricate labyrinths, collect hidden treasures, and challenge your friends—all within the familiar interface of Telegram.

## 🌌 Dive into the Maze

Embark on a journey through a world of vibrant mazes that evolve as you progress. Each maze is a unique blend of colors and challenges, offering a fresh experience every time you play.

- **Explore Dynamic Environments**: Wander through mazes that change in size and complexity, adorned with randomized color schemes for walls, floors, and portals.
- **Collect Treasures**: Discover hidden items scattered throughout the maze to boost your score and unlock special rewards.
- **Challenge Yourself**: With each maze completion, face larger and more complex mazes that test your strategic thinking and navigation skills.

## 🎮 How to Play

1. **Start the Game**: Open the MazeTon WebApp through Telegram.
2. **Navigate the Maze**:
   - On **mobile devices**, swipe in the direction you wish to move.
   - On **desktop**, use the arrow keys or WASD keys.
   - Alternatively, use your mouse's scroll wheel to move.
3. **Find the Exit**: Reach the glowing portal to complete the maze.
4. **Collect Items**: Pick up items along the way for extra points.
5. **Advance**: Each completed maze increases in size and difficulty.

## 🕹 Features

- **Intuitive Controls**: Seamless movement controls optimized for both mobile and desktop.
- **Stunning 3D Graphics**: Experience high-quality visuals rendered with Three.js.
- **Progress Saving**: Your position and progress are saved automatically.
- **Social Integration**: Connect with friends, view leaderboards, and share your achievements.
- **Dynamic Difficulty**: Mazes grow in complexity as you advance, keeping the challenge fresh.

## 🛠 Technology Stack

### Frontend

- **React** with **TypeScript**: For robust and maintainable UI development.
- **Three.js** and **@react-three/fiber**: Rendering the 3D maze environment.
- **@react-three/drei**: Enhancing Three.js with useful helpers and abstractions.
- **Tailwind CSS**: For responsive and modern styling.
- **Vite**: Lightning-fast development server and build tool.

### Backend

- **AWS Lambda**: Serverless functions for handling game logic and user data.
- **AWS DynamoDB**: NoSQL database for storing user profiles and maze configurations.
- **AWS SDK v3**: Interacting with AWS services in a scalable manner.

### Integration

- **Telegram WebApp API**: Embedding the game within Telegram for easy access.
- **Telegram Cloud Storage**: Saving user progress and settings across devices.

## 💡 Game Logic

### Maze Generation

- **Procedural Generation**: Each maze is generated using a depth-first search algorithm with backtracking, ensuring a unique and solvable maze every time.
- **Adaptive Difficulty**: The maze size increases incrementally, adding one unit to either the width or height after each completion, up to a maximum size.
- **Randomized Elements**: Walls, floors, player avatars, and portals are assigned random colors for a vibrant experience.

### Player Progression

- **Starting Point**: All players begin at the bottom-left corner of the maze.
- **Objective**: Reach the portal located at the farthest point from the starting position.
- **Scoring System**:
  - **Maze Completion**: Earn points equal to the area of the maze (width × height).
  - **Item Collection**: Additional points are awarded for each item collected.
- **Item Placement**:
  - Items appear in mazes larger than 10×10.
  - Positioned away from the start and finish to encourage exploration.

### Fair Play Enforcement

- **Anti-Cheat Measures**:
  - Minimum completion time is enforced based on the shortest possible path.
  - Players completing mazes suspiciously fast are temporarily blocked.
- **Penalty System**:
  - First offense results in a 1-hour block.
  - Subsequent offenses double the block duration, up to 24 hours.

## 🚀 Getting Started

### Prerequisites

- **Node.js** and **npm**: To run and build the project locally.
- **AWS Account**: For deploying backend services.
- **Telegram Bot Token**: To integrate with the Telegram WebApp API.

### Installation

1. **Clone the Repository**:

   ```bash
   git clone https://github.com/MazeTon/MazeTon.github.io
   ```

2. **Navigate to the Project Directory**:

   ```bash
   cd MazeTon.github.io
   ```

3. **Install Dependencies**:

   ```bash
   pnpm install
   ```

4. **Set Up AWS Services**:

   - **DynamoDB Tables**:
     - Create two tables: `User` and `Maze`.
     - Define the necessary primary keys and indexes as per the backend code requirements.
   - **Deploy Lambda Function**:
     - Package the backend code (provided in `lambda.js`).
     - Deploy it to AWS Lambda and configure the API Gateway endpoint.

5. **Run the Frontend**:

   ```bash
   pnpm dev
   ```

6. **Configure Telegram Bot**:

   - Set your bot's WebApp URL to the frontend's address (e.g., `https://yourdomain.com`).
   - Use BotFather in Telegram to set the domain:

     ```
     /setdomain
     ```

### Playing the Game

- Open Telegram and start a conversation with your bot.
- Click the **Start** button to launch the MazeTon WebApp.
- Begin your maze adventure!

## 🤝 Contributing

We welcome contributions from the community! To contribute:

1. **Fork the Repository**: Click the "Fork" button at the top of this page.
2. **Create a Feature Branch**:

   ```bash
   git checkout -b feature/YourFeature
   ```

3. **Commit Your Changes**:

   ```bash
   git commit -am 'Add your feature'
   ```

4. **Push to the Branch**:

   ```bash
   git push origin feature/YourFeature
   ```

5. **Open a Pull Request**: Submit your changes for review.

## 📄 License

This project is licensed under the MIT License.

## 📢 Acknowledgments

- **Three.js**: For the powerful 3D graphics library.
- **React Three Fiber**: Making Three.js usable in React applications.
- **Telegram**: For providing the platform and APIs to create engaging WebApps.
- **AWS**: For scalable backend infrastructure.
