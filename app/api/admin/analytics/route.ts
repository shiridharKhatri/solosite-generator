import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/db';
import { Project } from '@/models/Project';
import { User } from '@/models/User';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();
    const projectCount = await Project.countDocuments();
    const publishedCount = await Project.countDocuments({ status: 'published' });
    const userCount = await User.countDocuments();
    const { searchParams } = new URL(req.url);
    const range = searchParams.get('range') || '7d';
    let daysToFetch = 7;
    if (range === '24h') daysToFetch = 1;
    if (range === '30d') daysToFetch = 30;

    // Generate real data for the last X days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (daysToFetch - 1));
    startDate.setHours(0, 0, 0, 0);

    const projectData = await Project.aggregate([
      { $match: { createdAt: { $gte: startDate } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          projects: { $sum: 1 }
        }
      }
    ]);

    const publishedData = await Project.aggregate([
      { $match: { createdAt: { $gte: startDate }, status: 'published' } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          published: { $sum: 1 }
        }
      }
    ]);

    const chartData = [];
    for (let i = 0; i < daysToFetch; i++) {
      const d = new Date();
      d.setDate(d.getDate() - ((daysToFetch - 1) - i));
      const dateStr = d.toISOString().split('T')[0];
      const dayStr = d.toLocaleDateString('en-US', { weekday: 'short' });

      const proj = projectData.find((p: any) => p._id === dateStr);
      const pub = publishedData.find((p: any) => p._id === dateStr);

      chartData.push({
        name: dayStr,
        projects: proj ? proj.projects : 0,
        published: pub ? pub.published : 0,
      });
    }

    return NextResponse.json({ projectCount, publishedCount, userCount, chartData });
  } catch (error: any) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
