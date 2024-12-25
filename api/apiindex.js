// api/index.js
module.exports = async (req, res) => {
  try {
    if (req.method === 'POST') {
      const { message } = req.body;  // 假设请求体包含一个消息字段
      const response = await processWxMessage(message);
      res.status(200).json({ message: response });
    } else {
      res.status(405).json({ error: 'Method Not Allowed' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// 模拟处理微信消息的核心业务逻辑
async function processWxMessage(message) {
  // 这里可以替换为您原项目的实际处理逻辑
  return `Processed message: ${message}`;
}
