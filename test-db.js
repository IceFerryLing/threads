// 数据库连接测试脚本
const mongoose = require('mongoose');

// 数据库连接字符串
const MONGODB_URI = 'mongodb+srv://iceferryling:OA3sCSXh2LqrPCyv@cluster0.yfdbjdj.mongodb.net/?appName=Cluster0';

// 用户模型定义
const userSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Thread'
    }
  ],
  onboarded: {
    type: Boolean,
    default: false
  },
  communities: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Community'
    }
  ]
});

const User = mongoose.models.User || mongoose.model('User', userSchema);

// 测试函数
async function testDatabase() {
  console.log('开始测试数据库连接和数据写入...');
  
  try {
    // 1. 连接数据库
    console.log('步骤 1: 连接到 MongoDB 数据库');
    await mongoose.connect(MONGODB_URI);
    console.log('✓ 数据库连接成功');
    
    // 2. 测试数据写入
    console.log('\n步骤 2: 测试数据写入');
    
    const testUser = {
      id: 'test-user-123',
      username: 'testuser',
      name: 'Test User',
      bio: 'This is a test user for demonstration purposes',
      image: 'https://example.com/test-image.jpg'
    };
    
    console.log('创建测试用户数据:', testUser);
    
    // 插入或更新用户
    const result = await User.findOneAndUpdate(
      { id: testUser.id },
      {
        username: testUser.username.toLowerCase(),
        name: testUser.name,
        bio: testUser.bio,
        image: testUser.image,
        onboarded: true
      },
      { upsert: true, new: true }
    );
    
    console.log('✓ 用户数据操作成功:', result);
    
    // 3. 测试数据读取
    console.log('\n步骤 3: 测试数据读取');
    const foundUser = await User.findOne({ id: testUser.id });
    console.log('✓ 查询到的用户数据:', foundUser);
    
    // 4. 断开连接
    console.log('\n步骤 4: 断开数据库连接');
    await mongoose.disconnect();
    console.log('✓ 数据库连接已断开');
    
    console.log('\n🎉 所有测试步骤完成！数据库连接和数据写入功能正常。');
    
  } catch (error) {
    console.error('测试失败:', error.message);
    await mongoose.disconnect();
  }
}

// 执行测试
testDatabase();
