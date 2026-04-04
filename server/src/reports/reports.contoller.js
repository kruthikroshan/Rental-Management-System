import { ReportsService } from './reports.service.js';

export class ReportsController {
  // GET /reports/dashboard-stats
  static async getDashboardStats(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const stats = await ReportsService.getDashboardStats(startDate, endDate);
      res.json(stats);
    } catch (error) {
      console.error('Error in getDashboardStats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/top-categories
  static async getTopCategories(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const categories = await ReportsService.getTopCategories(limit);
      res.json(categories);
    } catch (error) {
      console.error('Error in getTopCategories:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/top-products
  static async getTopProducts(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const products = await ReportsService.getTopProducts(limit);
      res.json(products);
    } catch (error) {
      console.error('Error in getTopProducts:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/top-customers
  static async getTopCustomers(req, res) {
    try {
      const limit = parseInt(req.query.limit) || 10;
      const customers = await ReportsService.getTopCustomers(limit);
      res.json(customers);
    } catch (error) {
      console.error('Error in getTopCustomers:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/revenue-trends
  static async getRevenueTrends(req, res) {
    try {
      const days = parseInt(req.query.days) || 30;
      const trends = await ReportsService.getRevenueTrends(days);
      res.json(trends);
    } catch (error) {
      console.error('Error in getRevenueTrends:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/status-stats
  static async getStatusStats(req, res) {
    try {
      const stats = await ReportsService.getRentalStatusStats();
      res.json(stats);
    } catch (error) {
      console.error('Error in getStatusStats:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/analytics
  static async getAnalyticsReport(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const report = await ReportsService.getAnalyticsReport(startDate, endDate);
      res.json(report);
    } catch (error) {
      console.error('Error in getAnalyticsReport:', error);
      res.status(500).json({ error: error.message });
    }
  }

  // GET /reports/export/csv
  static async exportCSV(req, res) {
    try {
      const type = req.query.type || 'products'; // 'products', 'customers', 'revenue'
      let csvString = '';
      
      if (type === 'products') {
        const products = await ReportsService.getTopProducts(100);
        csvString = 'Product Name,Category,Rentals,Revenue\n';
        products.forEach(p => {
          csvString += `"${p.name}","${p.category || ''}",${p.rentalCount},${p.totalRevenue}\n`;
        });
      } else if (type === 'customers') {
        const customers = await ReportsService.getTopCustomers(100);
        csvString = 'Customer Name,Email,Rentals,Total Spent\n';
        customers.forEach(c => {
          csvString += `"${c.name}","${c.email}",${c.rentalCount},${c.totalSpent}\n`;
        });
      } else if (type === 'revenue') {
        const trends = await ReportsService.getRevenueTrends(90);
        csvString = 'Date,Revenue\n';
        trends.forEach(t => {
          csvString += `"${t.period}",${t.revenue}\n`;
        });
      } else {
        return res.status(400).json({ error: 'Invalid export type' });
      }

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename=export-${type}-${new Date().toISOString().split('T')[0]}.csv`);
      res.send(csvString);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      res.status(500).json({ error: error.message });
    }
  }
}