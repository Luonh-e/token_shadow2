import { useState } from "react";
import { ethers } from "ethers";
import TokenABI from "./abi/TokenABI.json";

const contractAddress = "0x69a155ddd740167Ff5022A96a6Ff98af0E6Cb0Aa";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setError(null);
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const symbol = await contract.symbol();
        const wallet = await signer.getAddress();
        const owner = await contract.owner();

        setWalletAddress(wallet);
        setTokenSymbol(symbol);
        setIsOwner(owner.toLowerCase() === wallet.toLowerCase());
      } else {
        throw new Error("MetaMask chưa được cài đặt!");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function checkBalance() {
    setError(null);
    try {
      if (walletAddress && typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const contract = new ethers.Contract(
          contractAddress,
          TokenABI,
          provider
        );

        const balance = await contract.balanceOf(walletAddress);
        setBalance(ethers.formatUnits(balance, 18));
      } else {
        throw new Error("Vui lòng kết nối ví trước khi kiểm tra số dư.");
      }
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function transferTokens() {
    setError(null);
    setIsLoading(true);
    try {
      if (!recipient || !amount) {
        throw new Error("Vui lòng nhập đầy đủ địa chỉ nhận và số lượng token.");
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const decimals = 18;
        const value = ethers.parseUnits(amount, decimals);

        const tx = await contract.transfer(recipient, value);
        await tx.wait();

        checkBalance();
        setRecipient("");
        setAmount("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function burnTokens(amount: any) {
    setError(null);
    setIsLoading(true);
    try {
      if (!amount) {
        throw new Error("Vui lòng nhập số lượng token để hủy.");
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const decimals = 18;
        const value = ethers.parseUnits(amount, decimals);

        const tx = await contract.burn(value);
        await tx.wait();

        alert("Đã hủy token thành công!");
        checkBalance();
        setAmount("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  async function initTokens(amount: any) {
    setError(null);
    setIsLoading(true);
    try {
      if (!amount) {
        throw new Error("Vui lòng nhập số lượng token để khởi tạo.");
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const decimals = 18;
        const value = ethers.parseUnits(amount, decimals);

        const tx = await contract.mint(walletAddress, value);
        await tx.wait();

        alert("Đã khởi tạo token thành công!");
        checkBalance();
        setAmount("");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-black flex items-center justify-center">
      <div className="bg-gray-500 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Shadow2 token - SDT</h1>
        {error && <p className="text-red-500 mb-4">Lỗi: {error}</p>}
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Kết nối ví
        </button>
        {walletAddress && (
          <p className="mt-4">
            Địa chỉ ví:{" "}
            <strong>
              {walletAddress.slice(0, 16)}...{walletAddress.slice(-8)}
            </strong>
          </p>
        )}
        <button
          onClick={checkBalance}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
        >
          Kiểm tra số dư
        </button>
        {balance && (
          <p className="mt-4">
            Số dư: <strong>{balance}</strong> {tokenSymbol}
          </p>
        )}
        <h3 className="mt-6 text-lg font-semibold">Chuyển Token</h3>
        <input
          type="text"
          placeholder="Địa chỉ nhận"
          value={recipient}
          onChange={(e) => setRecipient(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Số lượng"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <button
          onClick={transferTokens}
          className="mt-4 bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600"
          disabled={isLoading}
        >
          {isLoading ? "Đang xử lý..." : "Chuyển"}
        </button>
        <h3 className="mt-6 text-lg font-semibold">Burn Token</h3>
        <input
          type="number"
          placeholder="Số lượng token để hủy"
          disabled={!isOwner}
          className={`w-full p-2 mt-2 border rounded ${
            isOwner ? "bg-white" : "bg-gray-300 cursor-not-allowed"
          }`}
        />
        <button
          disabled={!isOwner || isLoading}
          onClick={() => burnTokens(amount)}
          className={`mt-4 px-4 py-2 rounded ${
            isOwner
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-red-500 text-white opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Hủy Token"}
        </button>
        <h3 className="mt-6 text-lg font-semibold">Tạo thêm Token</h3>
        <input
          type="number"
          placeholder="Số lượng token để khởi tạo"
          disabled={!isOwner}
          className={`w-full p-2 mt-2 border rounded ${
            isOwner ? "bg-white" : "bg-gray-300 cursor-not-allowed"
          }`}
        />
        <button
          disabled={!isOwner || isLoading}
          onClick={() => initTokens(amount)}
          className={`mt-4 px-4 py-2 rounded ${
            isOwner
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-yellow-500 text-white opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading ? "Đang xử lý..." : "Khởi tạo Token"}
        </button>
      </div>
    </div>
  );
}

export default App;
