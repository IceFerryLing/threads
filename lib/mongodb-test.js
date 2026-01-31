// MongoDB连接测试脚本
// 用于验证MongoDB数据库连接是否正常

const mongoose = require('mongoose');

// 从环境变量获取连接字符串
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://iceferryling:OA3sCSXh2LqrPCyv@cluster0.yfdbjdj.mongodb.net/?appName=Cluster0';

// 测试MongoDB连接
async function testMongoDBConnection() {
  console.log('开始测试MongoDB连接...');
  console.log('连接字符串:', MONGODB_URI);
  
  let connection;
  
  try {
    // 设置mongoose选项
    mongoose.set('strictQuery', true);
    
    // 尝试连接
    console.log('正在连接到MongoDB...');
    connection = await mongoose.connect(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5秒超时
    });
    
    // 验证连接
    const db = mongoose.connection;
    
    if (db.readyState === 1) {
      console.log('✓ MongoDB连接成功！');
      console.log('数据库名称:', db.name);
      console.log('主机:', db.host);
      
      // 测试简单操作：列出集合
      try {
        const collections = await db.db.listCollections().toArray();
        console.log('\n数据库中的集合:');
        if (collections.length > 0) {
          collections.forEach(collection => {
            console.log(`- ${collection.name}`);
          });
        } else {
          console.log('(暂无集合)');
        }
      } catch (err) {
        console.log('\n⚠️  列出集合时出错:', err.message);
      }
      
    } else {
      console.log('⚠️  MongoDB连接状态异常:', db.readyState);
    }
    
  } catch (error) {
    console.error('✗ MongoDB连接失败:', error.message);
    if (error.name === 'MongoServerError') {
      console.log('错误类型: MongoDB服务器错误');
    } else if (error.name === 'MongooseServerSelectionError') {
      console.log('错误类型: 服务器选择错误 (可能是网络问题或连接字符串错误)');
    }
    
    // 详细错误信息
    if (error.stack) {
      console.log('详细错误:', error.stack);
    }
    
  } finally {
    // 关闭连接
    if (connection) {
      try {
        await mongoose.disconnect();
        console.log('\n✓ 连接已关闭');
      } catch (err) {
        console.log('\n⚠️  关闭连接时出错:', err.message);
      }
    }
  }
}

// 运行测试
testMongoDBConnection();
