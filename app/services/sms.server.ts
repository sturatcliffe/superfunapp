const sendSms = async (body: string, to: string) => {
  try {
    if (process.env.CLICKSEND_USERNAME && process.env.CLICKSEND_API_KEY) {
      await fetch("https://rest.clicksend.com/v3/sms/send", {
        method: "post",
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.CLICKSEND_USERNAME}:${process.env.CLICKSEND_API_KEY}`
          ).toString("base64")}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              from: "SuperFunApp",
              to,
              body,
            },
          ],
        }),
      });
    }
  } catch (err) {
    console.error(`Failed to send SMS: ${err}`);
  }
};

export { sendSms };
