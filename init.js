const mongoose = require("mongoose");
const HiddenData = require("./models/hidden_data.js");

main()
.then(() => {
    console.log("Connection Successfull");
})
.catch((err) => {
    console.log(err);
});

async function main(){
    await mongoose.connect('mongodb://127.0.0.1:27017/hider_app');
};

let allData = [
    { hiddenData: "Project idea draft version 1", dataId: "a1b2c3", pass: "1111" },
    { hiddenData: "Confidential: exam answers (fake)", dataId: "d4e5f6", pass: "2222" },
    { hiddenData: "Reminder: call John at 6 PM", dataId: "g7h8i9", pass: "1111" },
    { hiddenData: "WiFi password: mywifi@2024", dataId: "j1k2l3", pass: "3333" },
    { hiddenData: "Hidden message: trust no one", dataId: "m4n5o6", pass: "4444" },
    { hiddenData: "Secret launch date: 15th July", dataId: "p7q8r9", pass: "2222" },
    { hiddenData: "Private diary entry #12", dataId: "s1t2u3", pass: "1111" },
    { hiddenData: "API key sample: 1234-5678-ABCD", dataId: "v4w5x6", pass: "5555" },
    { hiddenData: "Temporary login code: 9988", dataId: "y7z8a9", pass: "3333" },
    { hiddenData: "Meeting notes: project Alpha", dataId: "b1c2d3", pass: "4444" },
  
    { hiddenData: "Backup email password (fake)", dataId: "e4f5g6", pass: "2222" },
    { hiddenData: "Confidential design idea", dataId: "h7i8j9", pass: "1111" },
    { hiddenData: "Secret plan: phase 2 execution", dataId: "k1l2m3", pass: "5555" },
    { hiddenData: "Reminder: pay electricity bill", dataId: "n4o5p6", pass: "6666" },
    { hiddenData: "Hidden text: success is near", dataId: "q7r8s9", pass: "3333" },
    { hiddenData: "Private note: do daily coding", dataId: "t1u2v3", pass: "1111" },
    { hiddenData: "Fake bank OTP: 774411", dataId: "w4x5y6", pass: "4444" },
    { hiddenData: "Secret storage location X", dataId: "z7a8b9", pass: "2222" },
    { hiddenData: "Hidden credentials sample", dataId: "c1d2e3", pass: "5555" },
    { hiddenData: "Daily tasks list hidden", dataId: "f4g5h6", pass: "6666" },
  
    { hiddenData: "Password reset token example", dataId: "i7j8k9", pass: "3333" },
    { hiddenData: "Secret message: keep learning", dataId: "l1m2n3", pass: "1111" },
    { hiddenData: "Confidential client info (fake)", dataId: "o4p5q6", pass: "4444" },
    { hiddenData: "Private meeting summary", dataId: "r7s8t9", pass: "2222" },
    { hiddenData: "Hidden plan: startup idea", dataId: "u1v2w3", pass: "5555" },
    { hiddenData: "Temporary code: 555999", dataId: "x4y5z6", pass: "6666" },
    { hiddenData: "Secret API endpoint list", dataId: "a7b8c9", pass: "1111" },
    { hiddenData: "Hidden bug report details", dataId: "d1e2f3", pass: "3333" },
    { hiddenData: "Confidential HR note", dataId: "g4h5i6", pass: "2222" },
    { hiddenData: "Private log entry #45", dataId: "j7k8l9", pass: "4444" }
  ];

HiddenData.insertMany(allData).then((res) => {
    console.log(res);
}).catch((err) => {
    console.log(err);
});