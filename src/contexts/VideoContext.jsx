import { createContext, useContext, useMemo, useState } from 'react';

const VideoContext = createContext(null);

export function VideoProvider({ children }) {
  const [recentJobs, setRecentJobs] = useState([]);

  const addJob = (job) => {
    setRecentJobs((jobs) => [job, ...jobs.filter((item) => item.jobId !== job.jobId)]);
  };

  const updateJob = (jobId, updates) => {
    setRecentJobs((jobs) => jobs.map((job) => (job.jobId === jobId ? { ...job, ...updates } : job)));
  };

  const value = useMemo(() => ({ recentJobs, addJob, updateJob }), [recentJobs]);

  return <VideoContext.Provider value={value}>{children}</VideoContext.Provider>;
}

export function useVideoContext() {
  const context = useContext(VideoContext);
  if (!context) {
    throw new Error('useVideoContext must be used within a VideoProvider');
  }
  return context;
}
