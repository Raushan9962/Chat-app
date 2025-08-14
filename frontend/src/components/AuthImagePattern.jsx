const AuthImagePattern = ({ title, subtitle }) => {
  return (
    <div className="hidden lg:flex items-center justify-center bg-base-200 p-12">
      <div className="max-w-md text-center">
        <div className="grid grid-cols-3 gap-3 mb-8">
          {[...Array(9)].map((_, i) => (
            <div
              key={i}
              className={`bg-primary h-2 rounded col-span-1 ${i % 2 === 0 ? "animate-pulse" : ""}`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-base-content/60">{subtitle}</p>
      </div>
    </div>
  );
};

export default AuthImagePattern;
