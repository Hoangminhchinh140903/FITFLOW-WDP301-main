const mongoose = require('mongoose');
const { Schema } = mongoose;

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
    console.log("Connected to MongoDB fitflow_dev");
    const db = mongoose.connection.db;

    const collections = await db.collection('collections').find().toArray();
    for (const c of collections) {
        if (c.name.includes("Cổ phục") || c.name.includes("Hội An") || c.name.includes("Áo dài") || c.name.includes("Việt phục") || c.name.includes("Trang phục")) {
            let newName = c.name
                .replace(/Cổ phục/gi, "Đồ thể thao")
                .replace(/Việt phục/gi, "Đồ thể thao")
                .replace(/Hội An/gi, "Thanh Xuân")
                .replace(/Áo dài/gi, "Dụng cụ")
                .replace(/Trang phục/gi, "Đồ thể thao");
            await db.collection('collections').updateOne({ _id: c._id }, { $set: { name: newName } });
            console.log(`Updated collection: ${c.name} -> ${newName}`);
        }
    }

    const categories = await db.collection('categories').find().toArray();
    for (const c of categories) {
        if (c.name.includes("Cổ phục") || c.name.includes("Hội An") || c.name.includes("Áo dài") || c.name.includes("Việt phục") || c.name.includes("Trang phục")) {
            let newName = c.name
                .replace(/Cổ phục/gi, "Đồ thể thao")
                .replace(/Việt phục/gi, "Đồ thể thao")
                .replace(/Hội An/gi, "Thanh Xuân")
                .replace(/Áo dài/gi, "Vợt Tennis")
                .replace(/Trang phục/gi, "Đồ thể thao");
            await db.collection('categories').updateOne({ _id: c._id }, { $set: { name: newName } });
            console.log(`Updated category: ${c.name} -> ${newName}`);
        }
    }

    const products = await db.collection('products').find().toArray();
    for (const p of products) {
        let newName = p.name
                .replace(/Cổ phục/g, "Đồ thể thao")
                .replace(/cổ phục/g, "đồ thể thao")
                .replace(/Cổ Phục/g, "Đồ Thể Thao")
                .replace(/Việt phục/g, "Đồ thể thao")
                .replace(/Việt Phục/g, "Đồ Thể Thao")
                .replace(/việt phục/g, "đồ thể thao")
                .replace(/Hội An/g, "Thanh Xuân")
                .replace(/hội an/g, "thanh xuân")
                .replace(/Áo dài/g, "Vợt Tennis")
                .replace(/Áo Dài/g, "Vợt Tennis")
                .replace(/áo dài/g, "vợt tennis")
                .replace(/Nhật Bình/g, "Vợt Pickleball")
                .replace(/nhật bình/g, "vợt pickleball")
                .replace(/Trang phục/g, "Đồ thể thao")
                .replace(/Trang Phục/g, "Đồ Thể Thao")
                .replace(/trang phục/g, "đồ thể thao");
                
        let newDesc = p.description
                .replace(/Cổ phục/g, "Đồ thể thao")
                .replace(/cổ phục/g, "đồ thể thao")
                .replace(/Cổ Phục/g, "Đồ Thể Thao")
                .replace(/Việt phục/g, "Đồ thể thao")
                .replace(/Việt Phục/g, "Đồ Thể Thao")
                .replace(/việt phục/g, "đồ thể thao")
                .replace(/Hội An/g, "Thanh Xuân")
                .replace(/hội an/g, "thanh xuân")
                .replace(/Áo dài/g, "Vợt Tennis")
                .replace(/Áo Dài/g, "Vợt Tennis")
                .replace(/áo dài/g, "vợt tennis")
                .replace(/Nhật Bình/g, "Vợt Pickleball")
                .replace(/nhật bình/g, "vợt pickleball")
                .replace(/Trang phục/g, "Đồ thể thao")
                .replace(/Trang Phục/g, "Đồ Thể Thao")
                .replace(/trang phục/g, "đồ thể thao");

        if (newName !== p.name || newDesc !== p.description) {
            await db.collection('products').updateOne({ _id: p._id }, { $set: { name: newName, description: newDesc } });
            console.log(`Updated product: ${p.name} -> ${newName}`);
        }
    }

    console.log("Database update done!");
    process.exit(0);
}).catch(err => {
    console.error(err);
    process.exit(1);
});
