const ProgressTracker = {
  STORAGE_KEY: 'sm-progress',
  data: {},

  // 1. Initialize: Load saved progress or seed from JSON
  async init() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    if (saved) {
      this.data = JSON.parse(saved);
    } else {
      // First visit: Seed structure from courses.json
      try {
        const res = await fetch('data/courses.json');
        const json = await res.json();
        json.courses.forEach(c => {
          const code = c.code.toLowerCase().replace(/\s+/g, '');
          this.data[code] = []; // Start with empty completed list
        });
        this.save();
      } catch (e) {
        console.error('Failed to seed progress:', e);
      }
    }
  },

  // 2. Save to LocalStorage
  save() {
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.data));
  },

  // 3. Toggle a module's completion status
  toggle(courseCode, moduleId) {
    if (!this.data[courseCode]) this.data[courseCode] = [];
    const index = this.data[courseCode].indexOf(moduleId);
    
    if (index > -1) {
      this.data[courseCode].splice(index, 1); // Remove if exists
    } else {
      this.data[courseCode].push(moduleId); // Add if not exists
    }
    this.save();
  },

  // 4. Check if a module is complete
  isComplete(courseCode, moduleId) {
    return this.data[courseCode] && this.data[courseCode].includes(moduleId);
  },

  // 5. Calculate real percentage
  getPercentage(courseCode, totalModules) {
    if (!this.data[courseCode] || totalModules === 0) return 0;
    return Math.round((this.data[courseCode].length / totalModules) * 100);
  }
};
