import logo from './logo.svg';
import './App.css';


function App() {
  return (
  <div className="min-h-screen bg-gray-100">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-blue-600 mb-8">
          MERN Stack with Tailwind CSS
        </h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Backend Ready</h2>
            <p className="text-gray-600">Express.js server with MongoDB</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Frontend Ready</h2>
            <p className="text-gray-600">React with Tailwind CSS</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
