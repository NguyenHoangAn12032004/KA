import socketService from './socketService';
import { dashboardAPI } from './api';

interface StudentDashboardData {
  profile: any;
  savedJobs: any[];
  applications: any[];
  interviews: any[];
  viewedJobs: any[];
  stats: {
    profileCompletion: number;
    totalSkills: number;
    totalProjects: number;
    totalCertifications: number;
  };
}

interface RealtimeUpdate {
  type: 'job_viewed' | 'job_saved' | 'job_unsaved' | 'application_created' | 'application_updated' | 'profile_updated' | 'interview_scheduled' | 'stats_updated';
  data: any;
  timestamp: Date;
}

class RealtimeStudentService {
  private currentData: StudentDashboardData | null = null;
  private listeners: Map<string, Function[]> = new Map();
  private isConnected = false;
  private studentId: string | null = null;
  private socketListenersSetup = false;

  constructor() {
    // Don't setup listeners in constructor - wait for proper initialization
  }

  private async waitForSocketConnection(maxAttempts = 10): Promise<void> {
    return new Promise((resolve, reject) => {
      let attempts = 0;
      const checkConnection = () => {
        attempts++;
        if (socketService.isConnected) {
          console.log('✅ [RealtimeStudentService] Socket connection confirmed');
          resolve();
        } else if (attempts >= maxAttempts) {
          console.log('❌ [RealtimeStudentService] Socket connection timeout');
          reject(new Error('Socket connection timeout'));
        } else {
          console.log(`🔄 [RealtimeStudentService] Waiting for socket connection... (${attempts}/${maxAttempts})`);
          setTimeout(checkConnection, 500);
        }
      };
      checkConnection();
    });
  }

  private setupSocketListeners() {
    if (this.socketListenersSetup) {
      console.log('🔄 [RealtimeStudentService] Socket listeners already setup');
      return;
    }

    console.log('🔄 [RealtimeStudentService] Setting up socket listeners...');
    
    // Add debug logging to check if we're properly listening
    console.log('🎯 [RealtimeStudentService] Registering interview-scheduled listener...');
    
    // Listen for interview scheduling - MOST IMPORTANT for current issue
    socketService.on('interview-scheduled', (data: any) => {
      console.log('📅 [RealtimeStudentService] Interview scheduled:', data);
      this.handleRealtimeUpdate({
        type: 'interview_scheduled',
        data,
        timestamp: new Date()
      });
      
      // Force refresh data to get the latest interview information
      this.refresh();
      
      // Also emit a stats update to trigger UI refresh
      this.emit('stats_updated', this.currentData?.stats || {});
    });

    // Listen for notifications
    socketService.on('notification', (data: any) => {
      console.log('🔔 [RealtimeStudentService] Notification received:', data);
      // Emit notification to listeners
      this.emit('notification', data);
    });

    // Handle data_loaded event from backend
    socketService.on('student-dashboard-update', (data: any) => {
      console.log('📊 [RealtimeStudentService] Student dashboard update received:', data);
      
      // Check event type and emit accordingly
      if (data.type === 'data_loaded') {
        console.log('📊 [RealtimeStudentService] Processing data_loaded event with data:', data.data);
        
        // Extract stats from data and emit
        if (data.data && data.data.stats) {
          console.log('📊 [RealtimeStudentService] Emitting stats_updated with stats:', data.data.stats);
          this.emit('stats_updated', data.data.stats);
          this.emit('data_loaded', data.data);
        } else {
          console.log('❌ [RealtimeStudentService] No stats found in data_loaded payload:', data.data);
        }
      } else if (data.type === 'stats_updated') {
        console.log('📊 [RealtimeStudentService] Emitting stats_updated with data:', data.data);
        this.emit('stats_updated', data.data);
      }
      
      // Also emit the raw event
      this.emit(data.type, data.data);
    });

    this.socketListenersSetup = true;
  }

  private handleRealtimeUpdate(update: RealtimeUpdate) {
    if (!this.currentData || !this.studentId) return;

    console.log('🔄 [RealtimeStudentService] Processing update:', update.type);

    // Create a new data object to trigger React re-renders
    const newData = { ...this.currentData };

    switch (update.type) {
      case 'interview_scheduled':
        if (update.data.studentId === this.studentId) {
          // Add or update interview
          const existingIndex = newData.interviews.findIndex(interview => interview.id === update.data.id);
          if (existingIndex >= 0) {
            newData.interviews[existingIndex] = { ...newData.interviews[existingIndex], ...update.data };
          } else {
            newData.interviews.unshift(update.data);
          }
          
          // Update stats to reflect new interview count
          this.recalculateStats(newData);
        }
        break;

      case 'stats_updated':
        if (newData.stats) {
          newData.stats = { ...newData.stats, ...update.data };
        }
        break;
    }

    // Update current data
    this.currentData = newData;

    // Emit the updated data
    this.emit('data-updated', newData);
    this.emit('stats_updated', newData.stats);
  }

  private recalculateStats(data: StudentDashboardData) {
    if (!data.stats) {
      data.stats = {
        profileCompletion: 0,
        totalSkills: 0,
        totalProjects: 0,
        totalCertifications: 0
      };
    }

    console.log('📊 Updated stats:', {
      profileCompletion: data.stats.profileCompletion,
      totalSkills: data.stats.totalSkills,
      totalProjects: data.stats.totalProjects,
      totalCertifications: data.stats.totalCertifications
    });
  }

  // Initialize with student ID and load initial data
  async initialize(studentId: string) {
    console.log('🚀 [RealtimeStudentService] Initializing for student:', studentId);
    this.studentId = studentId;

    // Setup socket listeners if not already done
    if (!this.socketListenersSetup) {
      try {
        await this.waitForSocketConnection();
        this.setupSocketListeners();
      } catch (error) {
        console.warn('⚠️ [RealtimeStudentService] Socket connection failed, continuing without real-time updates');
        this.setupSocketListeners(); // Setup anyway for when connection comes back
      }
    }

    try {
      // Load initial data
      const response = await dashboardAPI.getStudentDashboard(studentId);
      if (response.data?.success && response.data?.data) {
        this.currentData = {
          profile: response.data.data.profile || {},
          savedJobs: response.data.data.savedJobs || [],
          applications: response.data.data.applications || [],
          interviews: response.data.data.interviews || [],
          viewedJobs: response.data.data.viewedJobs || [],
          stats: {
            profileCompletion: response.data.data.stats?.profileCompletion || 0,
            totalSkills: response.data.data.stats?.totalSkills || 0,
            totalProjects: response.data.data.stats?.totalProjects || 0,
            totalCertifications: response.data.data.stats?.totalCertifications || 0,
          }
        };
        console.log('✅ [RealtimeStudentService] Initial data loaded:', this.currentData);
        console.log('📊 [RealtimeStudentService] Stats from API:', response.data.data.stats);
        
        // Join student room for real-time updates
        if (socketService.isConnected) {
          socketService.joinUserRoom(studentId);
          this.isConnected = true;
          console.log('🔌 [RealtimeStudentService] Joined student room');
        }

        // Emit initial data
        this.emit('data-updated', this.currentData);
        this.emit('stats_updated', this.currentData.stats);
        console.log('📊 [RealtimeStudentService] Emitted initial stats:', this.currentData.stats);
      } else {
        // Provide fallback data structure if API call fails
        console.log('⚠️ [RealtimeStudentService] No data from API, using fallback structure');
        this.currentData = {
          profile: {},
          savedJobs: [],
          applications: [],
          interviews: [],
          viewedJobs: [],
          stats: {
            profileCompletion: 0,
            totalSkills: 0,
            totalProjects: 0,
            totalCertifications: 0
          }
        };
        this.emit('data-updated', this.currentData);
        this.emit('stats_updated', this.currentData.stats);
      }
    } catch (error) {
      console.error('❌ [RealtimeStudentService] Failed to load initial data:', error);
      // Still provide fallback data
      this.currentData = {
        profile: {},
        savedJobs: [],
        applications: [],
        interviews: [],
        viewedJobs: [],
        stats: {
          profileCompletion: 0,
          totalSkills: 0,
          totalProjects: 0,
          totalCertifications: 0
        }
      };
      this.emit('data-updated', this.currentData);
      this.emit('stats_updated', this.currentData.stats);
    }
  }

  getCurrentData(): StudentDashboardData | null {
    return this.currentData;
  }

  on(event: string, callback: Function) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)?.push(callback);
  }

  off(event: string, callback?: Function) {
    if (!this.listeners.has(event)) return;
    
    if (callback) {
      const callbacks = this.listeners.get(event) || [];
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    } else {
      this.listeners.delete(event);
    }
  }

  private emit(event: string, data: any) {
    const callbacks = this.listeners.get(event) || [];
    callbacks.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`Error in ${event} callback:`, error);
      }
    });
  }

  async refresh() {
    if (this.studentId) {
      await this.initialize(this.studentId);
    }
  }

  destroy() {
    this.listeners.clear();
    this.isConnected = false;
    this.currentData = null;
    this.studentId = null;
    this.socketListenersSetup = false;
  }

  isRealtimeConnected(): boolean {
    return this.isConnected && socketService.isConnected;
  }
}

export default new RealtimeStudentService();
