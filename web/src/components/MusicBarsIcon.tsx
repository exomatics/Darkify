const MusicBarsIcon = () => {
  return (
    <>
      <style>{`
        .music-bar {
          width: 3px;
          border-radius: 1px;
          transform-origin: bottom;
        }
        
        .music-bar-1 {
          height: 10px;
          animation: bounce1 0.6s infinite ease-in-out;
        }
        
        .music-bar-2 {
          height: 23px;
          animation: bounce2 0.8s infinite ease-in-out 0.1s;
        }
        
        .music-bar-3 {
          height: 12px;
          animation: bounce3 0.7s infinite ease-in-out 0.3s;
        }
        
        .music-bar-4 {
          height: 20px;
          animation: bounce4 0.9s infinite ease-in-out 0.2s;
        }
        
        .music-bar-5 {
          height: 15px;
          animation: bounce5 0.65s infinite ease-in-out 0.4s;
        }
        
        @keyframes bounce1 {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1); }
        }
        
        @keyframes bounce2 {
          0%, 100% { transform: scaleY(0.2); }
          30% { transform: scaleY(1); }
          60% { transform: scaleY(0.5); }
        }
        
        @keyframes bounce3 {
          0%, 100% { transform: scaleY(0.4); }
          40% { transform: scaleY(1); }
          80% { transform: scaleY(0.7); }
        }
        
        @keyframes bounce4 {
          0%, 100% { transform: scaleY(0.25); }
          25% { transform: scaleY(0.8); }
          50% { transform: scaleY(1); }
          75% { transform: scaleY(0.6); }
        }
        
        @keyframes bounce5 {
          0%, 100% { transform: scaleY(0.35); }
          60% { transform: scaleY(1); }
          20% { transform: scaleY(0.8); }
        }
      `}</style>

      <div className="flex scale-75 items-end justify-center space-x-[2px] w-12 h-8 p-2">
        <div className="music-bar bg-primary music-bar-1"></div>
        <div className="music-bar bg-primary music-bar-2"></div>
        <div className="music-bar bg-primary music-bar-3"></div>
        <div className="music-bar bg-primary music-bar-4"></div>
        <div className="music-bar bg-primary music-bar-5"></div>
      </div>
    </>
  );
};

export default MusicBarsIcon;
