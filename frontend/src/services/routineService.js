import { api } from './api';

export const FALLBACK_ROUTINES = [
  {
    _id: 'routine-morning-1',
    title: 'Morning Radiance & Defense',
    timeOfDay: 'morning',
    isActive: true,
    streakDays: 4,
    lastCompletedDate: '2026-11-02',
    steps: [
      {
        stepNumber: 1,
        title: 'Gentle Cleanse',
        category: 'cleanser',
        productName: 'Gentle Enzymatic Gel-to-Milk Cleanser',
        instructions: 'Massage on dry skin, emulsify with warm water, rinse thoroughly.',
        isCompleted: true,
      },
      {
        stepNumber: 2,
        title: 'Antioxidant & Clarity',
        category: 'treatment',
        productName: 'Clinical Niacinamide 10% Clarifying Essence',
        instructions: 'Pat 3 drops into skin to regulate sebum and contract pore appearance.',
        isCompleted: true,
      },
      {
        stepNumber: 3,
        title: 'Barrier Hydration',
        category: 'moisturizer',
        productName: 'Barrier Restoration Ceramide Elixir',
        instructions: 'Lock in moisture with a rich 3:1:1 lipid-mimic complex.',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        title: 'Cellular Photoprotection',
        category: 'sunscreen',
        productName: 'Photoprotective Fluid SPF 50+ PA++++',
        instructions: 'Generous 2 finger-lengths application to prevent UV-A/UV-B damage.',
        isCompleted: false,
      },
    ],
  },
  {
    _id: 'routine-evening-1',
    title: 'Nocturnal Cellular Recovery',
    timeOfDay: 'evening',
    isActive: true,
    streakDays: 3,
    lastCompletedDate: null,
    steps: [
      {
        stepNumber: 1,
        title: 'Melt Impurities & Sunscreen',
        category: 'cleanser',
        productName: 'Gentle Enzymatic Gel-to-Milk Cleanser',
        instructions: 'Double cleanse to dissolve daily particulate pollutants.',
        isCompleted: false,
      },
      {
        stepNumber: 2,
        title: 'Bio-Retinoid Renewal',
        category: 'serum',
        productName: 'Cellular Renewal Bio-Retinoid Serum',
        instructions: 'Apply 3 drops to accelerate overnight epidermal turnover.',
        isCompleted: false,
      },
      {
        stepNumber: 3,
        title: 'Periorbital Micro-Circulation',
        category: 'eye cream',
        productName: 'Peptide Firming Eye Contour Concentrate',
        instructions: 'Dab gently across orbital bone using ring finger.',
        isCompleted: false,
      },
      {
        stepNumber: 4,
        title: 'Lipid Seal & Recovery',
        category: 'moisturizer',
        productName: 'Barrier Restoration Ceramide Elixir',
        instructions: 'Generous layer to reinforce the moisture barrier during sleep.',
        isCompleted: false,
      },
    ],
  },
];

export const routineService = {
  getRoutines: async () => {
    try {
      const response = await api.get('/routines');
      if (response.data && response.data.length > 0) {
        return response.data;
      }
    } catch {
      // Local fallback
    }
    return FALLBACK_ROUTINES;
  },

  toggleStep: async (routineId, stepNumber) => {
    try {
      const response = await api.patch(`/routines/${routineId}/steps/${stepNumber}/toggle`);
      if (response.data) return response.data;
    } catch {
      // Local toggle
    }

    const r = FALLBACK_ROUTINES.find((item) => item._id === routineId);
    if (r) {
      const s = r.steps.find((step) => step.stepNumber === stepNumber);
      if (s) {
        s.isCompleted = !s.isCompleted;
      }
    }
    return r;
  },

  createRoutine: async (data) => {
    const res = await api.post('/routines', data);
    return res.data;
  },

  updateRoutine: async (id, data) => {
    const res = await api.put(`/routines/${id}`, data);
    return res.data;
  },

  deleteRoutine: async (id) => {
    const res = await api.delete(`/routines/${id}`);
    return res.data;
  },

  completeRoutine: async (id, data = {}) => {
    const res = await api.post(`/routines/${id}/complete`, data);
    return res.data;
  },

  getHistory: async () => {
    try {
      const res = await api.get('/routines/history');
      return res.data || [];
    } catch {
      return [];
    }
  },

  getStatistics: async () => {
    try {
      const res = await api.get('/routines/statistics');
      return res.data || null;
    } catch {
      return null;
    }
  },
};

export default routineService;
