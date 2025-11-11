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

let messages = [];

function createRandomEmail() {
  return {
    id: faker.string.uuid(),
    name: faker.person.firstName(),
    mail: faker.internet.email(),
    date: faker.date.present(),
  };
}

const email = createRandomEmail();
messages.push({
  id: email.id,
  from: email.mail,
  subject: `Hello from ${email.name}`,
  body: "Long message body here",
  received: email.date,
  read: false,
});

setInterval(() => { 
  const emails = faker.helpers.multiple(createRandomEmail, {
    count: 3,
  });

  emails.forEach((email) => {
    const alreadyExist = messages.some((message) => message.id === email.id);

    if (!alreadyExist) {
      messages.push({
        id: email.id,
        from: email.mail,
        subject: `Hello from ${email.username}`,
        body: "Long message body here",
        received: email.date,
        read: false,
      });
    }
  });
}, 10000)

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
