import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Star, ThumbsUp, MessageSquare, TrendingUp, Award, Filter, Download } from 'lucide-react';

interface Feedback {
  id: number;
  customerName: string;
  customerEmail: string;
  productName: string;
  productSku: string;
  rating: number;
  comment: string;
  category: string;
  date: string;
  helpful: number;
  bookingId: string;
}

interface ProductRating {
  productId: number;
  productName: string;
  category: string;
  avgRating: number;
  totalReviews: number;
  ratingDistribution: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

const FeedbackRatingDashboard: React.FC = () => {
  const [filterRating, setFilterRating] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  // Mock feedback data
  const feedbackData: Feedback[] = [
    {
      id: 1,
      customerName: 'Sarah Johnson',
      customerEmail: 'sarah@example.com',
      productName: 'Professional Camera Kit',
      productSku: 'PRD-001',
      rating: 5,
      comment: 'Excellent quality! The camera was in perfect condition and the rental process was smooth. Highly recommend!',
      category: 'Photography',
      date: '2025-10-24',
      helpful: 12,
      bookingId: 'BK-1234'
    },
    {
      id: 2,
      customerName: 'Mike Chen',
      customerEmail: 'mike@example.com',
      productName: 'DJ Equipment Pro',
      productSku: 'PRD-003',
      rating: 4,
      comment: 'Great equipment but setup instructions could be clearer. Overall satisfied with the rental.',
      category: 'Audio/Video',
      date: '2025-10-23',
      helpful: 8,
      bookingId: 'BK-1235'
    },
    {
      id: 3,
      customerName: 'Emma Wilson',
      customerEmail: 'emma@example.com',
      productName: 'Party Tent 20x20',
      productSku: 'PRD-004',
      rating: 5,
      comment: 'Perfect for our outdoor event! Easy to set up and looked amazing. Will rent again!',
      category: 'Events',
      date: '2025-10-22',
      helpful: 15,
      bookingId: 'BK-1236'
    },
    {
      id: 4,
      customerName: 'James Brown',
      customerEmail: 'james@example.com',
      productName: 'Lighting Equipment Set',
      productSku: 'PRD-002',
      rating: 3,
      comment: 'Equipment was okay but one light was not working properly. Customer service was helpful though.',
      category: 'Photography',
      date: '2025-10-21',
      helpful: 5,
      bookingId: 'BK-1237'
    },
    {
      id: 5,
      customerName: 'Lisa Anderson',
      customerEmail: 'lisa@example.com',
      productName: 'Sound System Premium',
      productSku: 'PRD-005',
      rating: 5,
      comment: 'Amazing sound quality! Perfect for our corporate event. Very professional service.',
      category: 'Audio/Video',
      date: '2025-10-20',
      helpful: 18,
      bookingId: 'BK-1238'
    },
    {
      id: 6,
      customerName: 'Tom Davis',
      customerEmail: 'tom@example.com',
      productName: 'Professional Camera Kit',
      productSku: 'PRD-001',
      rating: 4,
      comment: 'Good quality camera. Would have given 5 stars if the delivery was on time.',
      category: 'Photography',
      date: '2025-10-19',
      helpful: 6,
      bookingId: 'BK-1239'
    }
  ];

  // Mock product ratings
  const productRatings: ProductRating[] = [
    {
      productId: 1,
      productName: 'Professional Camera Kit',
      category: 'Photography',
      avgRating: 4.7,
      totalReviews: 124,
      ratingDistribution: { 5: 85, 4: 30, 3: 7, 2: 2, 1: 0 }
    },
    {
      productId: 2,
      productName: 'DJ Equipment Pro',
      category: 'Audio/Video',
      avgRating: 4.5,
      totalReviews: 98,
      ratingDistribution: { 5: 65, 4: 25, 3: 6, 2: 2, 1: 0 }
    },
    {
      productId: 3,
      productName: 'Party Tent 20x20',
      category: 'Events',
      avgRating: 4.8,
      totalReviews: 156,
      ratingDistribution: { 5: 125, 4: 25, 3: 4, 2: 2, 1: 0 }
    },
    {
      productId: 4,
      productName: 'Lighting Equipment Set',
      category: 'Photography',
      avgRating: 4.2,
      totalReviews: 87,
      ratingDistribution: { 5: 45, 4: 30, 3: 10, 2: 2, 1: 0 }
    }
  ];

  // Calculate stats
  const stats = {
    totalReviews: feedbackData.length,
    avgRating: (feedbackData.reduce((sum, f) => sum + f.rating, 0) / feedbackData.length).toFixed(1),
    fiveStarCount: feedbackData.filter(f => f.rating === 5).length,
    satisfactionRate: Math.round((feedbackData.filter(f => f.rating >= 4).length / feedbackData.length) * 100)
  };

  const renderStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map(star => (
          <Star
            key={star}
            className={`h-4 w-4 ${star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  const filteredFeedback = feedbackData.filter(feedback => {
    const ratingMatch = filterRating === 'all' || feedback.rating === parseInt(filterRating);
    const categoryMatch = filterCategory === 'all' || feedback.category === filterCategory;
    return ratingMatch && categoryMatch;
  });

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Award className="h-8 w-8 text-yellow-600" />
            Feedback & Rating Dashboard
          </h1>
          <p className="text-gray-600 mt-1">Monitor customer satisfaction and product performance</p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export Feedback Report
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              Total Reviews
            </CardDescription>
            <CardTitle className="text-3xl">{stats.totalReviews}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-600" />
              Average Rating
            </CardDescription>
            <CardTitle className="text-3xl flex items-center gap-2">
              {stats.avgRating}
              <span className="text-base text-gray-500">/ 5.0</span>
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <Award className="h-4 w-4 text-green-600" />
              5-Star Reviews
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{stats.fiveStarCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription className="flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-blue-600" />
              Satisfaction Rate
            </CardDescription>
            <CardTitle className="text-3xl text-blue-600">{stats.satisfactionRate}%</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Product Ratings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Product Performance</CardTitle>
          <CardDescription>Average ratings and review distribution by product</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {productRatings.map(product => (
              <div key={product.productId} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{product.productName}</h4>
                    <p className="text-sm text-gray-500">{product.totalReviews} reviews</p>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2">
                      <Star className="h-5 w-5 fill-yellow-400 text-yellow-400" />
                      <span className="text-2xl font-bold">{product.avgRating}</span>
                    </div>
                    <Badge variant="outline">{product.category}</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map(rating => {
                    const count = product.ratingDistribution[rating as keyof typeof product.ratingDistribution];
                    const percentage = (count / product.totalReviews) * 100;
                    return (
                      <div key={rating} className="flex items-center gap-3">
                        <div className="flex items-center gap-1 w-16">
                          <span className="text-sm">{rating}</span>
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        </div>
                        <Progress value={percentage} className="flex-1" />
                        <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Customer Reviews</CardTitle>
            <div className="flex items-center gap-3">
              <Filter className="h-4 w-4 text-gray-500" />
              <Select value={filterRating} onValueChange={setFilterRating}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="Photography">Photography</SelectItem>
                  <SelectItem value="Audio/Video">Audio/Video</SelectItem>
                  <SelectItem value="Events">Events</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredFeedback.map(feedback => (
              <Card key={feedback.id} className="border-l-4 border-l-yellow-400">
                <CardContent className="pt-6">
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar>
                          <AvatarFallback className="bg-blue-100 text-blue-600">
                            {feedback.customerName.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-semibold">{feedback.customerName}</p>
                          <p className="text-sm text-gray-500">{feedback.customerEmail}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        {renderStars(feedback.rating)}
                        <p className="text-sm text-gray-500 mt-1">{new Date(feedback.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{feedback.productName}</Badge>
                        <Badge variant="secondary">{feedback.category}</Badge>
                        <span className="text-sm text-gray-500">Booking: {feedback.bookingId}</span>
                      </div>
                      <p className="text-gray-700">{feedback.comment}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t">
                      <Button variant="ghost" size="sm" className="gap-2">
                        <ThumbsUp className="h-4 w-4" />
                        Helpful ({feedback.helpful})
                      </Button>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">Reply</Button>
                        <Button variant="ghost" size="sm">View Details</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Recent Feedback Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Feedback Summary</CardTitle>
          <CardDescription>Quick overview of all customer feedback</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Helpful Votes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredFeedback.map(feedback => (
                <TableRow key={feedback.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{feedback.customerName}</p>
                      <p className="text-sm text-gray-500">{feedback.customerEmail}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <p className="font-medium">{feedback.productName}</p>
                      <p className="text-sm text-gray-500">{feedback.productSku}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {renderStars(feedback.rating)}
                      <span className="font-semibold">{feedback.rating}.0</span>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(feedback.date).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{feedback.helpful} votes</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default FeedbackRatingDashboard;
