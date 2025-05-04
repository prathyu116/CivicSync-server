import { Request, Response } from 'express';
import mongoose from 'mongoose';
import Issue from '../models/issue.model';
import User from '../models/user.model'; 

export const createIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const { title, description, category, location, imageUrl } = req.body;
    const userId = req.user?.id; 

    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    if (!title || !description || !category || !location?.lat || !location?.lng) {
        return res.status(400).json({ message: 'Missing required fields: title, description, category, location (lat/lng)'});
    }

    const newIssue = new Issue({
      title,
      description,
      category,
      location,
      imageUrl,
      createdBy: userId,
    });

    const savedIssue = await newIssue.save();
    const populatedIssue = await savedIssue.populate('createdBy', 'name email');

    return res.status(201).json(populatedIssue);
  } catch (error: any) {
    console.error('Create issue error:', error.message);
    if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Server error creating issue' });
  }
};

export const getAllIssues = async (req: Request, res: Response): Promise<any> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const category = req.query.category as string;
    const status = req.query.status as string;
    const skip = (page - 1) * limit;

    let query: mongoose.FilterQuery<any> = {};

    if (category) {
      query.category = category;
    }
    if (status) {
      query.status = status;
    }

    const [items, total] = await Promise.all([
      Issue.find(query)
        .populate('createdBy', 'name') 
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Issue.countDocuments(query)
    ]);

    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return res.json({
      items,
      total,
      page,
      totalPages,
      hasMore
    });
  } catch (error: any) {
    console.error('Get issues error:', error.message);
    return res.status(500).json({ message: 'Server error fetching issues' });
  }
};

export const getIssueById = async (req: Request, res: Response): Promise<any> => {
  try {
    const issueId = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        return res.status(400).json({ message: 'Invalid Issue ID format' });
    }

    const issue = await Issue.findById(issueId).populate('createdBy', 'name email'); 

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    return res.json(issue);
  } catch (error: any) {
    console.error('Get issue by ID error:', error.message);
    return res.status(500).json({ message: 'Server error fetching issue details' });
  }
};

export const updateIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const issueId = req.params.id;
    const userId = req.user?.id;
    const { title, description, category, location, imageUrl } = req.body;

     if (!mongoose.Types.ObjectId.isValid(issueId)) {
        return res.status(400).json({ message: 'Invalid Issue ID format' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Authorization: Check owner
    if (issue.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: You cannot edit this issue' });
    }

    // Business Logic: Only allow edits if status is 'Pending'
    if (issue.status !== 'Pending') {
      return res.status(400).json({ message: `Cannot edit issue: Status is currently '${issue.status}'` });
    }

    // Update fields selectively
    issue.title = title ?? issue.title;
    issue.description = description ?? issue.description;
    issue.category = category ?? issue.category;
    if (location && (location.lat !== undefined || location.lng !== undefined)) {
         issue.location.lat = location.lat ?? issue.location.lat;
         issue.location.lng = location.lng ?? issue.location.lng;
         issue.location.address = location.address !== undefined ? location.address : issue.location.address;
    }
    // Handle null or empty string for image URL update explicitly
    issue.imageUrl = imageUrl !== undefined ? (imageUrl || null) : issue.imageUrl;

    const updatedIssue = await issue.save();
    await updatedIssue.populate('createdBy', 'name email');

    return res.json(updatedIssue);
  } catch (error: any) {
    console.error('Update issue error:', error.message);
     if (error.name === 'ValidationError') {
        return res.status(400).json({ message: 'Validation Error', errors: error.errors });
    }
    return res.status(500).json({ message: 'Server error updating issue' });
  }
};

export const updateIssueStatus = async (req: Request, res: Response): Promise<any> => {
    try {
        const issueId = req.params.id;
        const userId = req.user?.id;
        const { status } = req.body; // Expect 'status' in body now

        if (!mongoose.Types.ObjectId.isValid(issueId)) {
            return res.status(400).json({ message: 'Invalid Issue ID format' });
        }
        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }
        if (!status || !['In Progress', 'Resolved'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status. Must be "In Progress" or "Resolved"' });
        }

        const issue = await Issue.findById(issueId);

        if (!issue) {
            return res.status(404).json({ message: 'Issue not found' });
        }

        // Authorization: Check owner
        if (issue.createdBy.toString() !== userId) {
            return res.status(403).json({ message: 'Access denied: Only the creator can update status' });
        }

        // Business Logic for status changes
        if (issue.status === status) {
             return res.status(400).json({ message: `Issue is already '${status}'` });
        }
        if (issue.status === 'Resolved') { // Cannot change away from Resolved
             return res.status(400).json({ message: 'Cannot change status of a resolved issue' });
        }

        issue.status = status;
        const updatedIssue = await issue.save();
        await updatedIssue.populate('createdBy', 'name email');

        return res.json(updatedIssue);

    } catch (error: any) {
        console.error('Update issue status error:', error.message);
        if (error.name === 'ValidationError') {
           return res.status(400).json({ message: 'Validation Error', errors: error.errors });
       }
        return res.status(500).json({ message: 'Server error updating issue status' });
    }
};


export const deleteIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const issueId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        return res.status(400).json({ message: 'Invalid Issue ID format' });
    }
     if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issue = await Issue.findById(issueId);

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }

    // Authorization: Check owner
    if (issue.createdBy.toString() !== userId) {
      return res.status(403).json({ message: 'Access denied: You cannot delete this issue' });
    }

    if (issue.status !== 'Pending') {
       return res.status(400).json({ message: `Cannot delete issue: Status is currently '${issue.status}'` });
    }

    await issue.deleteOne();


    return res.status(200).json({ message: 'Issue deleted successfully' }); 
  } catch (error: any) {
    console.error('Delete issue error:', error.message);
    return res.status(500).json({ message: 'Server error deleting issue' });
  }
};

export const voteForIssue = async (req: Request, res: Response): Promise<any> => {
  try {
    const issueId = req.params.id;
    const userId = req.user?.id;

    if (!mongoose.Types.ObjectId.isValid(issueId)) {
        return res.status(400).json({ message: 'Invalid Issue ID format' });
    }
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issue = await Issue.findById(issueId);
    const user = await User.findById(userId); 

    if (!issue) {
      return res.status(404).json({ message: 'Issue not found' });
    }
     if (!user) {
      return res.status(404).json({ message: 'Voting user not found' });
    }

    const issueAlreadyVoted = issue.votedBy.some(voterId => voterId.equals(userId));
    const userAlreadyVoted = user.votes.some(votedIssueId => votedIssueId.equals(issueId));

    if (issueAlreadyVoted || userAlreadyVoted) {
      return res.status(400).json({ message: 'You have already voted for this issue' });
    }

    issue.votes += 1;
    issue.votedBy.push(new mongoose.Types.ObjectId(userId));
    await issue.save();

    user.votes.push(new mongoose.Types.ObjectId(issueId));
    await user.save();

    await issue.populate('createdBy', 'name email'); 

    return res.json(issue);
  } catch (error: any) {
    console.error('Vote issue error:', error.message);
    return res.status(500).json({ message: 'Server error processing vote' });
  }
};

export const getMyIssues = async (req: Request, res: Response): Promise<any> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const issues = await Issue.find({ createdBy: userId })
      .populate('createdBy', 'name') 
      .sort({ createdAt: -1 });

    return res.json(issues);
  } catch (error: any) {
    console.error('Get my issues error:', error.message);
    return res.status(500).json({ message: 'Server error fetching your issues' });
  }
};