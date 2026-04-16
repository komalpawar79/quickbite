import Message from '../models/Message.js';
import ApiResponse from '../utils/apiResponse.js';

export const submitMessage = async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    console.log('📨 Message submission attempt:', { name, email, phone, subject });

    // Validation
    if (!name || !email || !subject || !message) {
      console.log('❌ Validation failed - missing fields');
      return res.status(400).json(
        new ApiResponse(400, null, 'Please provide all required fields')
      );
    }

    // Create new message
    const newMessage = new Message({
      name,
      email,
      phone,
      subject,
      message,
      status: 'new'
    });

    await newMessage.save();

    console.log('✅ Message saved successfully:', newMessage._id);

    res.status(201).json(
      new ApiResponse(201, { message: newMessage }, 'Message submitted successfully. We will get back to you soon!')
    );
  } catch (error) {
    console.error('❌ Error submitting message:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to submit message')
    );
  }
};

export const getAllMessages = async (req, res) => {
  try {
    const { status, sortBy } = req.query;
    let query = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    console.log('📬 Fetching messages with query:', query);

    let messages = await Message.find(query);

    console.log('✅ Found', messages.length, 'messages');

    // Sort by latest by default
    if (sortBy === 'oldest') {
      messages = messages.reverse();
    }

    res.status(200).json(
      new ApiResponse(200, {
        count: messages.length,
        messages
      }, 'Messages fetched successfully')
    );
  } catch (error) {
    console.error('❌ Error fetching messages:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to fetch messages')
    );
  }
};

export const getMessageById = async (req, res) => {
  try {
    const message = await Message.findById(req.params.id)
      .populate('repliedBy', 'name email');

    if (!message) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Message not found')
      );
    }

    // Mark as read
    if (message.status === 'new') {
      message.status = 'read';
      await message.save();
    }

    res.status(200).json(
      new ApiResponse(200, { message }, 'Message fetched successfully')
    );
  } catch (error) {
    console.error('Error fetching message:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to fetch message')
    );
  }
};

export const replyMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;
    const userId = req.userId;

    console.log('💬 Reply attempt:', { id, reply, userId });

    if (!reply) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Reply text is required')
      );
    }

    const message = await Message.findByIdAndUpdate(
      id,
      {
        reply,
        status: 'replied',
        repliedAt: new Date(),
        repliedBy: userId
      },
      { new: true }
    ).populate('repliedBy', 'name email');

    console.log('✅ Reply saved successfully:', { messageId: id, status: message.status });

    res.status(200).json(
      new ApiResponse(200, { message }, 'Reply sent successfully')
    );
  } catch (error) {
    console.error('❌ Error replying to message:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to send reply')
    );
  }
};

export const toggleStarMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findById(id);

    if (!message) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Message not found')
      );
    }

    message.isStarred = !message.isStarred;
    await message.save();

    res.status(200).json(
      new ApiResponse(200, { message }, 'Message starred status updated')
    );
  } catch (error) {
    console.error('Error toggling star:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to update message')
    );
  }
};

export const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;
    const message = await Message.findByIdAndDelete(id);

    if (!message) {
      return res.status(404).json(
        new ApiResponse(404, null, 'Message not found')
      );
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Message deleted successfully')
    );
  } catch (error) {
    console.error('Error deleting message:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to delete message')
    );
  }
};

export const getUserMessages = async (req, res) => {
  try {
    const { email } = req.query;

    if (!email) {
      return res.status(400).json(
        new ApiResponse(400, null, 'Email is required')
      );
    }

    console.log('📬 Fetching user messages for:', email);

    const messages = await Message.find({ email })
      .populate('repliedBy', 'name email')
      .sort({ createdAt: -1 });

    console.log('✅ Found', messages.length, 'messages for user');

    res.status(200).json(
      new ApiResponse(200, {
        count: messages.length,
        messages
      }, 'User messages fetched successfully')
    );
  } catch (error) {
    console.error('❌ Error fetching user messages:', error);
    res.status(500).json(
      new ApiResponse(500, null, 'Failed to fetch user messages')
    );
  }
};
