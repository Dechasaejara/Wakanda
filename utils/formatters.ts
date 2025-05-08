/**
 * Format date to readable string
 */
export function formatDate(dateString?: string): string {
    if (!dateString) return "N/A";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Today or yesterday
    if (diffDays === 0) {
      return `Today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays === 1) {
      return `Yesterday at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else if (diffDays < 7) {
      // This week
      return date.toLocaleDateString([], { weekday: 'long' }) + 
        ` at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      // Older dates
      return date.toLocaleDateString([], { 
        month: 'short', 
        day: 'numeric',
        year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined
      });
    }
  }
  
  /**
   * Get difficulty label with consistent styling
   */
  export function getDifficultyLabel(difficulty?: string): string {
    if (!difficulty) return "Unknown";
    
    switch (difficulty.toLowerCase()) {
      case "beginner":
        return "Beginner";
      case "intermediate":
        return "Intermediate";
      case "advanced":
        return "Advanced";
      default:
        return difficulty;
    }
  }
  
  /**
   * Format points number with K suffix for thousands
   */
  export function formatPoints(points: number): string {
    if (points >= 1000) {
      return (points / 1000).toFixed(1) + 'K';
    }
    return points.toString();
  }
  
  /**
   * Format time in seconds to readable format
   */
  export function formatTime(seconds: number): string {
    if (seconds < 60) {
      return `${seconds}s`;
    }
    
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (remainingSeconds === 0) {
      return `${minutes}m`;
    }
    
    return `${minutes}m ${remainingSeconds}s`;
  }

  