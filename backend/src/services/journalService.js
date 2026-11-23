const SkinJournal = require('../models/SkinJournal');
const SkinProgressPhoto = require('../models/SkinProgressPhoto');
const Routine = require('../models/Routine');

class JournalService {
  /**
   * Create or update daily skin journal entry
   */
  async upsertDailyEntry(userId, data) {
    const today = data.date || new Date().toISOString().split('T')[0];

    const entry = await SkinJournal.findOneAndUpdate(
      { userId, date: today },
      {
        userId,
        date: today,
        overallCondition: data.overallCondition || 'Balanced',
        dryness: Number(data.dryness) || 2,
        oiliness: Number(data.oiliness) || 2,
        redness: Number(data.redness) || 1,
        breakouts: Number(data.breakouts) || 1,
        sensitivity: Number(data.sensitivity) || 1,
        hydrationPerception: data.hydrationPerception || 'Moderate',
        texturePerception: data.texturePerception || 'Smooth / Refined',
        notes: data.notes || '',
        productsUsed: data.productsUsed || [],
        sleepHours: data.sleepHours || null,
        waterIntakeLiters: data.waterIntakeLiters || null,
      },
      { upsert: true, new: true }
    );

    return entry;
  }

  /**
   * Get journal entries for user
   */
  async getEntries(userId, { limit = 30, page = 1 } = {}) {
    const skip = (Math.max(1, parseInt(page, 10)) - 1) * parseInt(limit, 10);
    const total = await SkinJournal.countDocuments({ userId });
    const entries = await SkinJournal.find({ userId })
      .sort({ date: -1 })
      .skip(skip)
      .limit(parseInt(limit, 10));

    return {
      entries,
      total,
      page: parseInt(page, 10),
      totalPages: Math.ceil(total / parseInt(limit, 10)),
    };
  }

  /**
   * Get single entry by ID
   */
  async getEntryById(userId, id) {
    const entry = await SkinJournal.findOne({ _id: id, userId });
    if (!entry) {
      const error = new Error('Journal entry not found');
      error.statusCode = 404;
      throw error;
    }
    return entry;
  }

  /**
   * Update entry by ID
   */
  async updateEntry(userId, id, data) {
    const entry = await SkinJournal.findOneAndUpdate(
      { _id: id, userId },
      { $set: data },
      { new: true }
    );
    if (!entry) {
      const error = new Error('Journal entry not found');
      error.statusCode = 404;
      throw error;
    }
    return entry;
  }

  /**
   * Delete entry
   */
  async deleteEntry(userId, id) {
    const entry = await SkinJournal.findOneAndDelete({ _id: id, userId });
    if (!entry) {
      const error = new Error('Journal entry not found');
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: 'Journal entry deleted.' };
  }

  /**
   * Save progress photo
   */
  async savePhoto(userId, photoData) {
    if (!photoData.photoUri) {
      const error = new Error('Photo URI is required');
      error.statusCode = 400;
      throw error;
    }

    const today = photoData.date || new Date().toISOString().split('T')[0];

    return SkinProgressPhoto.create({
      userId,
      date: today,
      photoUri: photoData.photoUri,
      angle: photoData.angle || 'Frontal / Full Face',
      lightingCondition: photoData.lightingCondition || 'Natural Daylight',
      notes: photoData.notes || '',
    });
  }

  /**
   * Get user's progress photos
   */
  async getPhotos(userId) {
    return SkinProgressPhoto.find({ userId }).sort({ date: -1 });
  }

  /**
   * Delete progress photo
   */
  async deletePhoto(userId, photoId) {
    const photo = await SkinProgressPhoto.findOneAndDelete({ _id: photoId, userId });
    if (!photo) {
      const error = new Error('Photo not found');
      error.statusCode = 404;
      throw error;
    }
    return { success: true, message: 'Progress photo deleted.' };
  }

  /**
   * Chronological timeline aggregating journal logs, routine events, and product changes
   */
  async getTimeline(userId) {
    const [entries, photos, routines] = await Promise.all([
      SkinJournal.find({ userId }).sort({ date: -1 }).limit(20).lean(),
      SkinProgressPhoto.find({ userId }).sort({ date: -1 }).limit(10).lean(),
      Routine.find({ userId }).lean(),
    ]);

    const events = [];

    // Add journal events
    for (const e of entries) {
      events.push({
        type: 'journal',
        id: e._id,
        date: e.date,
        title: `Skin Check-In: ${e.overallCondition}`,
        description: e.notes || `Dryness: ${e.dryness}/5 • Breakouts: ${e.breakouts}/5 • Redness: ${e.redness}/5`,
        metrics: {
          dryness: e.dryness,
          oiliness: e.oiliness,
          redness: e.redness,
          breakouts: e.breakouts,
          sensitivity: e.sensitivity,
        },
        productsUsed: e.productsUsed,
      });
    }

    // Add photo events
    for (const p of photos) {
      events.push({
        type: 'photo',
        id: p._id,
        date: p.date,
        title: `Progress Photo (${p.angle})`,
        description: p.notes || `Captured under ${p.lightingCondition}`,
        photoUri: p.photoUri,
      });
    }

    // Add routine introduction events
    for (const r of routines) {
      events.push({
        type: 'routine',
        id: r._id,
        date: r.createdAt.toISOString().split('T')[0],
        title: `Active Protocol: ${r.title}`,
        description: `${r.steps?.length || 0} steps configured for ${r.timeOfDay}.`,
      });
    }

    // Sort descending by date
    events.sort((a, b) => new Date(b.date) - new Date(a.date));

    return events;
  }

  /**
   * Compute progress trend metrics (dryness, oiliness, breakout reduction, consistency)
   */
  async getProgressStatistics(userId) {
    const entries = await SkinJournal.find({ userId }).sort({ date: 1 }).limit(30).lean();

    if (entries.length === 0) {
      return {
        totalEntries: 0,
        consistencyScore: 0,
        averages: { dryness: 2, oiliness: 2, breakouts: 1, redness: 1, sensitivity: 1 },
        trendHistory: [],
        insight: 'Complete your first daily journal entry to begin tracking your skin barrier evolution over time.',
      };
    }

    const n = entries.length;
    const avg = (key) => (entries.reduce((sum, e) => sum + (e[key] || 0), 0) / n).toFixed(1);

    const trendHistory = entries.map((e) => ({
      date: e.date,
      dryness: e.dryness,
      oiliness: e.oiliness,
      breakouts: e.breakouts,
      redness: e.redness,
      sensitivity: e.sensitivity,
    }));

    // Calculate breakout trajectory
    const firstHalf = entries.slice(0, Math.ceil(n / 2));
    const secondHalf = entries.slice(Math.ceil(n / 2));
    const firstHalfBreakouts = firstHalf.reduce((s, e) => s + (e.breakouts || 0), 0) / (firstHalf.length || 1);
    const secondHalfBreakouts = secondHalf.reduce((s, e) => s + (e.breakouts || 0), 0) / (secondHalf.length || 1);

    let trajectory = 'Stable';
    if (secondHalfBreakouts < firstHalfBreakouts) {
      trajectory = 'Improving (Decreasing Breakouts)';
    } else if (secondHalfBreakouts > firstHalfBreakouts) {
      trajectory = 'Elevated Breakout Frequency';
    }

    return {
      totalEntries: n,
      consistencyScore: Math.min(100, Math.round((n / 14) * 100)),
      averages: {
        dryness: Number(avg('dryness')),
        oiliness: Number(avg('oiliness')),
        breakouts: Number(avg('breakouts')),
        redness: Number(avg('redness')),
        sensitivity: Number(avg('sensitivity')),
      },
      trajectory,
      trendHistory,
      insight:
        trajectory.includes('Improving')
          ? 'Your skin demonstrates positive barrier stabilization and reduced blemish severity over the recorded journal period.'
          : 'Normal skin fluctuations observed. Ensure consistent sunscreen reapplication and avoid introducing multiple new actives simultaneously.',
    };
  }
}

const journalService = new JournalService();

module.exports = {
  journalService,
};
