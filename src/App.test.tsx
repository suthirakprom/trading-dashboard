import { BrowserRouter } from 'react-router-dom';

function App() {
    return (
        <BrowserRouter>
            <div className="min-h-screen bg-[#0B0E11] text-white p-8">
                <h1 className="text-4xl font-bold">Trading App Test</h1>
                <p>If you can see this, React is working!</p>
                <div className="mt-4">
                    <a href="/login" className="text-blue-500">Go to Login</a>
                </div>
            </div>
        </BrowserRouter>
    );
}

export default App;
