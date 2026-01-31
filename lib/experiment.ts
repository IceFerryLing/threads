// 代码逻辑实验文件
// 此文件用于演示项目的核心逻辑，包括数据库连接、模型操作等

import { connectToDB } from './mongoose';
import User from './models/user.model';

// 实验函数：演示数据库连接和用户模型操作
export async function runExperiment() {
  console.log('开始代码逻辑实验...');
  
  try {
    // 1. 连接数据库
    console.log('步骤 1: 连接到 MongoDB 数据库');
    await connectToDB();
    console.log('✓ 数据库连接成功');
    
    // 2. 演示用户模型操作
    console.log('\n步骤 2: 演示用户模型操作');
    
    // 2.1 创建测试用户数据
    const testUser = {
      userId: 'test-user-123',
      username: 'testuser',
      name: 'Test User',
      bio: 'This is a test user for demonstration purposes',
      image: 'https://example.com/test-image.jpg',
    };
    
    console.log('创建测试用户数据:', testUser);
    
    // 2.2 插入或更新用户
    console.log('插入或更新用户数据...');
    const result = await User.findOneAndUpdate(
      { id: testUser.userId },
      {
        username: testUser.username.toLowerCase(),
        name: testUser.name,
        bio: testUser.bio,
        image: testUser.image,
        onboarded: true,
      },
      { upsert: true, new: true }
    );
    
    console.log('✓ 用户数据操作成功:', result);
    
    // 2.3 查询用户
    console.log('\n步骤 3: 查询用户数据');
    const foundUser = await User.findOne({ id: testUser.userId });
    console.log('✓ 查询到的用户数据:', foundUser);
    
    // 2.4 演示错误处理
    console.log('\n步骤 4: 演示错误处理');
    try {
      // 尝试创建无效用户（缺少必要字段）
      await User.create({});
    } catch (error) {
      console.log('✓ 错误处理测试成功:', (error as Error).message);
    }
    
    console.log('\n🎉 所有实验步骤完成！');
    
  } catch (error) {
    console.error('实验失败:', (error as Error).message);
  }
}

// 如果直接运行此文件，则执行实验
if (require.main === module) {
  runExperiment();
}
