#!/usr/bin/env node

/**
 * Analytics System Integration Test
 * Verifies backend-database connection for analytics
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Order from './models/Order.js';
import MenuItem from './models/MenuItem.js';
import Canteen from './models/Canteen.js';

dotenv.config();

const test = async () => {
  try {
    console.log('\n📊 ANALYTICS INTEGRATION TEST\n');
    
    // Connect to database
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/quickbite');
    console.log('✅ Database connected');

    // Get first canteen
    const canteen = await Canteen.findOne();
    if (!canteen) {
      console.log('❌ No canteen found in database');
      process.exit(1);
    }
    console.log(`✅ Found canteen: ${canteen.name} (${canteen._id})`);

    // Test 1: Count today orders
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = await Order.countDocuments({ 
      canteen: canteen._id, 
      createdAt: { $gte: today }, 
      status: { $ne: 'cancelled' } 
    });
    console.log(`📈 Today Orders: ${todayOrders}`);

    // Test 2: Today revenue (completed payments)
    const todayRevenueAgg = await Order.aggregate([
      { $match: { 
        canteen: canteen._id, 
        createdAt: { $gte: today }, 
        paymentStatus: 'completed' 
      } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const todayRevenue = todayRevenueAgg[0]?.total || 0;
    console.log(`💰 Today Revenue: ₹${todayRevenue}`);

    // Test 3: Total revenue (all-time)
    const totalRevenueAgg = await Order.aggregate([
      { $match: { 
        canteen: canteen._id, 
        paymentStatus: 'completed' 
      } },
      { $group: { _id: null, total: { $sum: '$finalAmount' } } }
    ]);
    const totalRevenue = totalRevenueAgg[0]?.total || 0;
    console.log(`💎 Total Revenue: ₹${totalRevenue}`);

    // Test 4: Active orders
    const activeOrders = await Order.countDocuments({ 
      canteen: canteen._id, 
      status: { $in: ['pending', 'confirmed', 'preparing', 'ready'] } 
    });
    console.log(`🔄 Active Orders: ${activeOrders}`);

    // Test 5: Completed orders
    const completedOrders = await Order.countDocuments({ 
      canteen: canteen._id, 
      status: 'completed' 
    });
    console.log(`✅ Completed Orders: ${completedOrders}`);

    // Test 6: Menu items
    const totalMenuItems = await MenuItem.countDocuments({ canteen: canteen._id });
    console.log(`🍽️  Menu Items: ${totalMenuItems}`);

    // Test 7: Popular items
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    
    const popularItems = await Order.aggregate([
      { $match: { canteen: canteen._id, createdAt: { $gte: startDate }, status: { $ne: 'cancelled' } } },
      { $unwind: '$items' },
      { $group: { _id: '$items.menuItem', totalSold: { $sum: '$items.quantity' }, revenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } } } },
      { $sort: { totalSold: -1 } },
      { $limit: 5 },
      { $lookup: { from: 'menuitems', localField: '_id', foreignField: '_id', as: 'item' } },
      { $unwind: '$item' },
      { $project: { name: '$item.name', totalSold: 1, revenue: 1, price: '$item.price' } }
    ]);
    console.log(`\n🌟 Popular Items (Last 7 Days): ${popularItems.length}`);
    popularItems.forEach((item, idx) => {
      console.log(`   ${idx + 1}. ${item.name} - ${item.totalSold} sold (₹${item.revenue})`);
    });

    console.log('\n✅ All tests passed! Database integration is working.');
    console.log('\n📝 Expected API Response Structure:');
    console.log(JSON.stringify({
      statusCode: 200,
      success: true,
      message: 'Success',
      data: {
        todayOrders,
        todayRevenue,
        totalRevenue,
        activeOrders,
        completedOrders,
        totalMenuItems
      },
      timestamp: new Date().toISOString()
    }, null, 2));

    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    process.exit(1);
  }
};

test();
