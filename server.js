import express from "express";
import cors from "cors";
import pino from "pino";
import pinoPretty from "pino-pretty";
import { faker } from "@faker-js/faker";

const app = express();
const logger = pino(pinoPretty());

app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader("Content-Type", "application/json");
  next();
});

function createRandomUser() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    date: faker.date.past(),
  };
}

const users = faker.helpers.multiple(createRandomUser, {
  count: 5,
});

let messages = [];

users.forEach((user) => { 
  messages.push({
    id: user.userId,
    from: user.email,
    subject: `Hello from ${user.username}`,
    body: "Long message body here",
    received: user.date,
    read: false,
  });
})

app.get("/messages/unread", (req, res) => {
  const unreadMessages = messages.filter((msg) => !msg.read);

  const responseBody = {
    status: "ok",
    timestamp: Date.now(),
    messages: unreadMessages,
  };

  logger.info("Unread messages requested");
  res.status(200).json(responseBody);
});

const port = process.env.PORT || 7070;

const bootstrap = async () => {
  try {
    app.listen(port, () =>
      logger.info(`Server has been started on http://localhost:${port}`)
    );
  } catch (error) {
    console.error(error);
  }
};

bootstrap();
