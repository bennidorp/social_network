const aws = require("aws-sdk");

let secrets;
if (process.env.NODE_ENV == "production") {
    secrets = process.env; // in prod the secrets are environment variables
} else {
    secrets = require("./secrets"); // in dev they are in secrets.json which is listed in .gitignore
}

const ses = new aws.SES({
    accessKeyId: secrets.AWS_KEY,
    secretAccessKey: secrets.AWS_SECRET,
    region: "eu-west-1",
});

//polarized.cabin@spicedling.email

exports.sendEmail = (message, subject) => {
    return ses
        .sendEmail({
            Source: "The Vue-Tang Clan <polarized.cabin@spicedling.email>",
            Destination: {
                ToAddresses: ["polarized.cabin@spicedling.email"],
            },
            Message: {
                Body: {
                    Text: {
                        Data: message,
                    },
                },
                Subject: {
                    Data: subject,
                },
            },
        })
        .promise()
        .then(() => console.log("Yes, it worked!"))
        .catch((err) => console.log(err));
};
