import { useState } from "react";
import { ethers } from "ethers";
import TokenABI from "./abi/TokenABI.json";
// import TokenTransferrerABI from "./abi/TokenABI.json"; // Đảm bảo bạn đã tạo và import ABI cho TokenTransferrer

const contractAddress = "0x69a155ddd740167Ff5022A96a6Ff98af0E6Cb0Aa";
// const tokenTransferrerAddress = "0xYourTokenTransferrerAddress";

function App() {
  const [walletAddress, setWalletAddress] = useState("");
  const [tokenSymbol, setTokenSymbol] = useState("");
  const [balance, setBalance] = useState("");
  const [recipient, setRecipient] = useState("");
  const [amount, setAmount] = useState("");
  const [spenderAddress, setSpenderAddress] = useState("");
  const [approveAmount, setApproveAmount] = useState("");
  const [fromAddress, setFromAddress] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [transferAmount, setTransferAmount] = useState("");
  const [isOwner, setIsOwner] = useState(false);
  const [isLoading, setIsLoading] = useState({
    connectWallet: false,
    checkBalance: false,
    transferTokens: false,
    burnTokens: false,
    initTokens: false,
    approveSpender: false,
    transferFromSpender: false,
  });
  const [error, setError] = useState<string | null>(null);

  async function connectWallet() {
    setError(null);
    setIsLoading((prev) => ({ ...prev, connectWallet: true }));
    try {
      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        await provider.send("eth_requestAccounts", []); // Yêu cầu kết nối ví
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
    } finally {
      setIsLoading((prev) => ({ ...prev, connectWallet: false }));
    }
  }

  async function checkBalance() {
    setError(null);
    setIsLoading((prev) => ({ ...prev, checkBalance: true }));
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
    } finally {
      setIsLoading((prev) => ({ ...prev, checkBalance: false }));
    }
  }

  async function transferTokens() {
    setError(null);
    setIsLoading((prev) => ({ ...prev, transferTokens: true }));
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
      setIsLoading((prev) => ({ ...prev, transferTokens: false }));
    }
  }

  async function burnTokens(amount: any) {
    setError(null);
    setIsLoading((prev) => ({ ...prev, burnTokens: true }));
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
      setIsLoading((prev) => ({ ...prev, burnTokens: false }));
    }
  }

  async function initTokens(amount: any) {
    setError(null);
    setIsLoading((prev) => ({ ...prev, initTokens: true }));
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
      setIsLoading((prev) => ({ ...prev, initTokens: false }));
    }
  }

  async function approveSpender() {
    setError(null);
    setIsLoading((prev) => ({ ...prev, approveSpender: true }));
    try {
      if (!spenderAddress || !approveAmount) {
        throw new Error(
          "Vui lòng nhập địa chỉ spender và số lượng token để approve."
        );
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const decimals = 18;
        const value = ethers.parseUnits(approveAmount, decimals);

        const tx = await contract.approve(spenderAddress, value);
        await tx.wait();

        alert(`Đã cấp phép ${approveAmount} token cho ${spenderAddress}`);
        setSpenderAddress("");
        setApproveAmount("");
      } else {
        throw new Error("MetaMask chưa được cài đặt!");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading((prev) => ({ ...prev, approveSpender: false }));
    }
  }

  async function transferFromSpender() {
    setError(null);
    setIsLoading((prev) => ({ ...prev, transferFromSpender: true }));
    try {
      if (!fromAddress || !toAddress || !transferAmount) {
        throw new Error(
          "Vui lòng nhập đầy đủ thông tin: địa chỉ gửi, địa chỉ nhận và số lượng token để chuyển."
        );
      }

      if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(contractAddress, TokenABI, signer);

        const decimals = 18;
        const value = ethers.parseUnits(transferAmount, decimals);

        const currentAllowance = await contract.allowance(
          fromAddress,
          walletAddress
        );

        const formattedAllowance = parseFloat(
          ethers.formatUnits(currentAllowance, 18)
        );

        if (currentAllowance < value) {
          alert(
            `Hạn mức allowance không đủ. Hiện tại bạn chỉ có thể chi tiêu ${formattedAllowance} token`
          );
          return;
        }

        const tx = await contract.transferFrom(fromAddress, toAddress, value);
        await tx.wait();

        alert(
          `Chuyển thành công ${transferAmount} token từ ${fromAddress} đến ${toAddress}`
        );
        setFromAddress("");
        setToAddress("");
        setTransferAmount("");
        checkBalance(); // Cập nhật lại số dư sau khi chuyển
      } else {
        throw new Error("MetaMask chưa được cài đặt!");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading((prev) => ({ ...prev, transferFromSpender: false }));
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-700 to-black flex items-center justify-center">
      <div className="bg-gray-500 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold mb-4">Shadow2 token - SDT</h1>
        {error && <p className="text-red-500 mb-4">Lỗi: {error}</p>}

        {/* Kết nối ví */}
        <button
          onClick={connectWallet}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          disabled={isLoading.connectWallet}
        >
          {isLoading.connectWallet ? "Đang kết nối..." : "Kết nối ví"}
        </button>
        {walletAddress && (
          <p className="mt-4">
            Địa chỉ ví:{" "}
            <strong>
              {walletAddress.slice(0, 16)}...{walletAddress.slice(-8)}
            </strong>
          </p>
        )}

        {/* Kiểm tra số dư */}
        <button
          onClick={checkBalance}
          className="mt-4 bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
          disabled={isLoading.checkBalance}
        >
          {isLoading.checkBalance ? "Đang kiểm tra..." : "Kiểm tra số dư"}
        </button>
        {balance && (
          <p className="mt-4">
            Số dư: <strong>{balance}</strong> {tokenSymbol}
          </p>
        )}

        {/* Chuyển Token trực tiếp từ ví */}
        <h3 className="mt-6 text-lg font-semibold">
          Chuyển Token trực tiếp từ ví
        </h3>
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
          disabled={isLoading.transferTokens}
        >
          {isLoading.transferTokens ? "Đang chuyển..." : "Chuyển"}
        </button>

        {/* Cấp Phép/Ủy Quyền */}
        <h3 className="mt-6 text-lg font-semibold">
          Cấp Phép / Ủy Quyền cho ví hoặc contract
        </h3>
        <input
          type="text"
          placeholder="Địa chỉ"
          value={spenderAddress}
          onChange={(e) => setSpenderAddress(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Số lượng token approve"
          value={approveAmount}
          onChange={(e) => setApproveAmount(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <button
          onClick={approveSpender}
          className="mt-4 bg-indigo-500 text-white px-4 py-2 rounded hover:bg-indigo-600"
          disabled={isLoading.approveSpender}
        >
          {isLoading.approveSpender ? "Đang cấp phép..." : "Cấp Phép"}
        </button>

        {/* Chuyển Token qua cấp phép */}
        <h3 className="mt-6 text-lg font-semibold">
          Chuyển Token được ủy quyền từ ví khác
        </h3>
        <p className="text-sm text-gray-200">
          Giả sử ví hiện tại connect là B được ủy quyền từ A và muốn chuyển
          token qua C thì địa chỉ gửi là A và nhận là C.
        </p>
        <input
          type="text"
          placeholder="Địa chỉ gửi/ đã uỷ quyền"
          value={fromAddress}
          onChange={(e) => setFromAddress(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <input
          type="text"
          placeholder="Địa chỉ nhận"
          value={toAddress}
          onChange={(e) => setToAddress(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <input
          type="number"
          placeholder="Số lượng token để chuyển"
          value={transferAmount}
          onChange={(e) => setTransferAmount(e.target.value)}
          className="w-full p-2 mt-2 border rounded-lg"
        />
        <button
          onClick={transferFromSpender}
          className="mt-4 bg-pink-500 text-white px-4 py-2 rounded hover:bg-pink-600"
          disabled={isLoading.transferFromSpender}
        >
          {isLoading.transferFromSpender ? "Đang chuyển..." : "Chuyển"}
        </button>

        {/* Burn Token */}
        <h3 className="mt-6 text-lg font-semibold">Burn Token</h3>
        <input
          type="number"
          placeholder="Số lượng token để hủy"
          disabled={!isOwner}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full p-2 mt-2 border rounded ${
            isOwner ? "bg-white" : "bg-gray-300 cursor-not-allowed"
          }`}
        />
        <button
          disabled={!isOwner || isLoading.burnTokens}
          onClick={() => burnTokens(amount)}
          className={`mt-4 px-4 py-2 rounded ${
            isOwner
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-red-500 text-white opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading.burnTokens ? "Đang hủy..." : "Hủy Token"}
        </button>

        {/* Tạo thêm Token */}
        <h3 className="mt-6 text-lg font-semibold">Tạo thêm Token</h3>
        <input
          type="number"
          placeholder="Số lượng token để khởi tạo"
          disabled={!isOwner}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className={`w-full p-2 mt-2 border rounded ${
            isOwner ? "bg-white" : "bg-gray-300 cursor-not-allowed"
          }`}
        />
        <button
          disabled={!isOwner || isLoading.initTokens}
          onClick={() => initTokens(amount)}
          className={`mt-4 px-4 py-2 rounded ${
            isOwner
              ? "bg-yellow-500 text-white hover:bg-yellow-600"
              : "bg-yellow-500 text-white opacity-50 cursor-not-allowed"
          }`}
        >
          {isLoading.initTokens ? "Đang khởi tạo..." : "Khởi tạo Token"}
        </button>
      </div>
    </div>
  );
}

export default App;
