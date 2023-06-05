import { PaymentGateway } from 'payment-getway-typescript';
import React, { useState } from 'react';


interface SendProps {
    api: PaymentGateway; // Add the `api` prop type declaration

}

function Send({ showForm, setShowForm }: any) {



    const [recipient, setRecipient] = useState('');
    const [currency, setCurrency] = useState('USD');
    const [amount, setAmount] = useState('');
    let paymeny = new PaymentGateway("ws://127.0.0.1:9944");

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        await connect();
        // Convert the amount to a number
        const parsedAmount = parseFloat(amount);
        const address = localStorage.getItem("account");
        if (!address) {
            return;
        }
        const storedAccount = JSON.parse(address);

        if (!storedAccount) {
            return;
        }
        // Call the transfer function from the PaymentGateway instance
        const transferResult = await paymeny.transfer({
            address: storedAccount.address,
            mnemonic: storedAccount.mnemonic
        }, recipient, parsedAmount);


        setRecipient('');
        setAmount('');
    };

    const connect = async (): Promise<void> => {
        await paymeny.connect();
    };

    return showForm && (
        <div className="metamask-form">
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="recipient">Recipient Address:</label>
                    <input
                        type="text"
                        id="recipient"
                        value={recipient}
                        onChange={(e) => setRecipient(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="currency">Currency:</label>
                    <select
                        id="currency"
                        value={currency}
                        onChange={(e) => setCurrency(e.target.value)}
                        className="form-select"
                    >
                        <option value="USD">USD</option>
                        <option value="EUR">EUR</option>
                        <option value="GBP">GBP</option>
                    </select>
                    <span className="form-balance">
                        Balance: {currency === 'USD' ? '$1000' : ''}
                    </span>
                </div>
                <div className="form-group">
                    <label htmlFor="amount">Amount:</label>
                    <input
                        type="number"
                        id="amount"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="form-input"
                    />
                </div>
                <div className='btn-container'>
                    <button type="submit" className="form-button">
                        Send
                    </button>
                    <button onClick={()=>setShowForm(!showForm)} className="form-button">
                        Back
                    </button>
                </div>
            </form>
        </div>
    );
}

export default Send;
