const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/fitflow_dev').then(async () => {
    const db = mongoose.connection.db;
    const products = await db.collection('products').find().toArray();
    
    const tennisImages = [
        'https://images.unsplash.com/photo-1617083934555-56abbceef229?auto=format&fit=crop&q=80&w=400&h=400',
        'https://images.unsplash.com/photo-1622279457486-62dcc4a631d6?auto=format&fit=crop&q=80&w=400&h=400',
        'https://images.unsplash.com/photo-1595435934249-5df7ed86e1c0?auto=format&fit=crop&q=80&w=400&h=400'
    ];
    const pickleballImages = [
        'https://images.unsplash.com/photo-1695420367258-299f2a9693eb?auto=format&fit=crop&q=80&w=400&h=400',
        'https://images.unsplash.com/photo-1688636189569-45e0f7e12693?auto=format&fit=crop&q=80&w=400&h=400'
    ];
    const sportsWearImages = [
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=400',
        'https://images.unsplash.com/photo-1483721310020-03333e577078?auto=format&fit=crop&q=80&w=400&h=400',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=400'
    ];
    
    for (const p of products) {
        let nameLower = p.name.toLowerCase();
        let catLower = (p.category || '').toLowerCase();
        let img = 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=400&h=400';
        
        if (nameLower.includes('tennis') || catLower.includes('tennis') || nameLower.includes('vợt')) {
            img = tennisImages[Math.floor(Math.random() * tennisImages.length)];
        } 
        if (nameLower.includes('pickleball') || catLower.includes('pickleball')) {
            img = pickleballImages[Math.floor(Math.random() * pickleballImages.length)];
        }
        if (nameLower.includes('áo') || nameLower.includes('quần') || nameLower.includes('đồ thể thao')) {
            img = sportsWearImages[Math.floor(Math.random() * sportsWearImages.length)];
        }
        
        await db.collection('products').updateOne({ _id: p._id }, { $set: { images: [img], imageUrl: img } });
    }
    console.log('Done updating images!');
    process.exit(0);
});
