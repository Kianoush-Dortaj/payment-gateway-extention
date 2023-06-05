import React, { FunctionComponent, ReactNode, useEffect, useState } from "react";
import { MdOutlineSettings, MdOutlineEast, MdContentCopy } from "react-icons/md";
import { Accordion, Logo, IconWeb3, BraveModal } from "../components";
import * as environment from "../environment";
import { ApiPromise, WsProvider } from "@polkadot/api";
import { cryptoWaitReady, mnemonicGenerate } from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import { BsClipboard } from "react-icons/bs";
import { IconContext } from "react-icons";
import { MdSwapVert, MdMonetizationOn, MdAttachMoney, MdSend } from "react-icons/md";
import { Route, Routes, Link } from "react-router-dom"
import Send from "../components/Send";
import { PaymentGateway } from 'payment-getway-typescript';

interface Token {
  icon: ReactNode;
  name: string;
  balance: number;
}

interface PopupChain {
  chainName: string;
  isWellKnown: boolean;
  details: ChainDetails[];
}

interface ChainDetails {
  tabId?: number;
  url?: string;
  peers: number;
  isSyncing: boolean;
  chainId: string;
  bestBlockHeight: number | undefined;
}

const Popup: FunctionComponent = () => {
  const [connChains, setConnChains] = useState<PopupChain[] | undefined>();
  const [showModal, setShowModal] = useState<boolean>(false);
  const [accountAddress, setAccountAddress] = useState<string | null>(null);
  const [selectedTab, setSelectedTab] = useState("Assets");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [balanceToken, setBalance] = useState<any>(0);
  const [events, setEvents] = useState<any[]>([]);
  const [showForm, setShowForm] = useState<boolean>(false);


  let api = new PaymentGateway("ws://127.0.0.1:9944");

  const tabs = [
    { id: "Assets", label: "Assets" },
    { id: "NFTs", label: "NFTs" },
    { id: "Activities", label: "Activities" },
  ];

  const handleTabClick = (tab: string, event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Prevent the default button behavior
    setSelectedTab(tab);
  };



  const copyToClipboard = () => {
    if (accountAddress) {
      navigator.clipboard.writeText(accountAddress);
    }
  };

  const refresh = () => {
    environment.getAllActiveChains().then((chains) => {
      const allChains: PopupChain[] = [];
      (chains || []).forEach((c) => {
        const i = allChains.findIndex(
          (i) => i.chainName === c.chainName && i.isWellKnown === c.isWellKnown
        );
        const { peers, isSyncing, chainId, bestBlockHeight } = c;
        if (i === -1) {
          allChains.push({
            chainName: c.chainName,
            isWellKnown: c.isWellKnown,
            details: [
              {
                tabId: c.tab.id,
                url: c.tab.url,
                peers,
                isSyncing,
                chainId,
                bestBlockHeight,
              },
            ],
          });
        } else {
          const details = allChains[i]?.details;
          if (!details.map((d) => d.tabId).includes(c.tab.id)) {
            details.push({
              tabId: c.tab.id,
              url: c.tab.url,
              peers,
              isSyncing,
              chainId,
              bestBlockHeight,
            });
          }
        }
      });
      setConnChains([...allChains]);
    });
  };

  // const handleEvent = (eventData: any) => {
  //   setEvents((prevEvents) => [...prevEvents, eventData]);
  // };

  useEffect(() => {
    const init = async () => {
      // Identify Brave browser and show Popup
      const isBrave = await window.navigator?.brave?.isBrave();
      const braveSetting = await environment.get({ type: "braveSetting" });
      setShowModal(!!isBrave && !braveSetting);

      await api.connect();

      const storedAccount = localStorage.getItem("account");
      if (storedAccount) {
        const parsedAccount = JSON.parse(storedAccount);
        setAccountAddress(parsedAccount.address);
        getBalance(parsedAccount.address);
        // const unsubscribe = await subscribeToEvents(parsedAccount.address);
        await api.subscribeToEventsForAccount(parsedAccount.address, (eventData: any) => {
          setEvents((prevEvents) => [...prevEvents, {
            from: eventData.data[0].value,
            to: eventData.data[1].value,
            amount: eventData.data[2].value,
          }]);
        })
        // return () => unsubscribe();
      } else {
        await createWallet(); // Call createWallet if no account is found
      }
    };

    const createWallet = async (): Promise<void> => {
      const newAccount = await api.createAccount();
      localStorage.setItem("account", JSON.stringify(newAccount));
      setAccountAddress(newAccount.address);
      getBalance(newAccount.address);
      // await subscribeToEvents(newAccount.address);
    };

    // const subscribeToEvents = async (address: string): Promise<() => void> => {
    //   const eventCallback = (eventData: any) => {
    //     handleEvent(eventData);
    //   };

    //   const unsubscribe: any = await api.subscribeToEventsForAccount(address, eventCallback);
    //   return unsubscribe;
    // };

    const copyToClipboard = () => {
      if (accountAddress) {
        navigator.clipboard.writeText(accountAddress);
      }
    };

    const getBalance = async (address: string): Promise<void> => {
      const balance = await api.getBalance(address);
      setBalance(balance);
    };

    // Sample token data
    const sampleTokens: Token[] = [
      {
        icon: "",
        name: "ETH",
        balance: 10.5,
      },
      {
        icon: "",
        name: "BTC",
        balance: 5.2,
      },
      // Add more token objects as needed
    ];
    setTokens(sampleTokens);

    const unregister = environment.onActiveChainsChanged(() => refresh());
    init();
    return unregister;
  }, []);


  const networkIcon = (network: string, isWellKnown: boolean) => {
    const icon = network.toLowerCase();
    return (
      <>
        <IconWeb3 isWellKnown={isWellKnown}>{icon}</IconWeb3>
        <div className="pl-2">{network}</div>
      </>
    );
  };

  const renderAssets = () => {
    const assetData = [
      { name: "BTC", balance: 10, icon: <MdSwapVert /> },
      { name: "ETH", balance: 100, icon: <MdMonetizationOn /> },
      // Add more assets as needed
    ];

    return (
      <div className="balance">
        {assetData.map((asset) => (
          <div key={asset.name} className="asset-item">
            <div className="asset-icon">{asset.icon}</div>
            <div className="asset-name">{asset.name}</div>
            <div className="asset-balance">{asset.balance}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderMain = () => {
    return (
      <div className="main">
        <div className="my-8 balance">
          <div className="balance-container">{balanceToken} PKM</div>
          <div className="balance-info">$12.98 USD</div>

          <div className="button-group flex justify-center">
            <div className="button-container">
              <button className="circle-button">
                <IconContext.Provider value={{ className: "button-icon" }}>
                  <MdSwapVert />
                </IconContext.Provider>
              </button>
              <span className="button-text">Swap</span>
            </div>
            <div className="button-container">
              {/* <Link to="/send"> */}
              <button className="circle-button">
                <IconContext.Provider value={{ className: "button-icon" }}>
                  <MdMonetizationOn />
                </IconContext.Provider>
              </button>
              <span className="button-text">Sell</span>
              {/* </Link> */}
            </div>
            <div className="button-container">
              <button className="circle-button">
                <IconContext.Provider value={{ className: "button-icon" }}>
                  <MdAttachMoney />
                </IconContext.Provider>
              </button>
              <span className="button-text">Buy</span>
            </div>
            {/* <div className="button-container">
            <Link to="/send">
              <button className="circle-button">
                <IconContext.Provider value={{ className: "button-icon" }}>
                  <MdSend />
                </IconContext.Provider>
              </button>
              <span className="button-text">Send</span>
            </Link>
          </div> */}
            <div onClick={() => setShowForm(!showForm)} className="button-container">
              {/* <Link to="/send"> */}
              <button className="circle-button">
                <IconContext.Provider value={{ className: "button-icon" }}>
                  <MdSend />
                </IconContext.Provider>
              </button>
              <span className="button-text">Send</span>
              {/* </Link> */}
            </div>
          </div>

          {/* <Routes>
          <Route path="/send" element={<Send api={api} />} />
        </Routes> */}
        </div>
      </div>
    );
  };

  const renderNFTs = () => {
    // Render your NFTs content here
    return <div>NFTs Content</div>;
  };

  const renderActivities = () => {
    return (
      <div className="activities-container">
        <ul className="activities-list">
          {events.map((event, index) => (
            <li key={index} className="activity-item">
              <div className="activity-from"><div className="from">From:</div><div className="value">{event.from}</div></div>
              <div className="activity-to"><div className="from">To:</div><div className="value">{event.to}</div></div>
              <div className="activity-amount"><div className="from">Amount:</div><div className="value">{event.amount}</div></div>
            </li>
          ))}
        </ul>
      </div>
    );
  };



  return (
    <>
      <BraveModal show={showModal} />
      <main className="w-80">
        <header className="mt-3 mx-8 flex justify-between border-b border-neutral-200 pt-1.5 pb-4 leading-4">
          <div className="header">
            <div className="network-info">
              <div className="network-name">Pikamo Testnet</div>
              <div className="account-name">Kianoush</div>
            </div>
            <div className="address">
              {accountAddress ? (
                <>
                  <span className="address-container">{accountAddress}</span>
                  <button className="copy-button" onClick={copyToClipboard}>
                    <MdContentCopy />
                  </button>
                </>
              ) : (
                <span>No account found. Please create a wallet.</span>
              )}
            </div>
          </div>
        </header>
        <div className={!connChains?.length ? "" : "pb-3.5"}>
          {!connChains?.length && !showForm ? (
            renderMain()
          ) : (
            connChains?.map((w) => {
              if (w?.details?.length === 1 && !w?.details[0].tabId)
                return (
                  <>
                    <div className="block mt-4">
                      <div
                        key={w.chainName}
                        className="pl-6 flex text-lg"
                      >
                        {networkIcon(w.chainName, w.isWellKnown)}
                      </div>
                      <div className="pl-[4.5rem] text-sm flex pt-2">
                        <span className="text-[#323232]">Latest block</span>
                        <span className="pl-2 text-[#24CC85]">
                          {w?.details[0].bestBlockHeight?.toLocaleString(
                            "en-US"
                          ) || "Syncing..."}
                        </span>
                      </div>
                    </div>
                    <div className="pl-[4.5rem] flex pt-2 pb-4 text-[#616161]">
                      No network
                    </div>
                  </>
                );
              const contents: ReactNode[] = [];
              w?.details?.forEach((t) => {
                if (t.tabId) {
                  contents.push(
                    <div
                      key={t.url}
                      className="flex justify-between"
                    >
                      <div className="ml-8 text-sm w-full truncate text-base">
                        {t.url}
                      </div>
                    </div>
                  );
                }
              });

              return (
                <Accordion
                  defaultAllExpanded={true}
                  titleClass="popup-accordion-title"
                  contentClass="popup-accordion-content"
                  titles={[
                    <div className="block mt-4">
                      <div className="pl-4 flex text-lg justify-start">
                        {networkIcon(w.chainName, w.isWellKnown)}
                        <span className="pl-2 text-[#616161]">
                          ({contents.length})
                        </span>
                      </div>
                      <div className="pl-16 flex pt-2">
                        <span className="text-[#323232]">Latest block</span>
                        <span className="pl-2 text-[#24CC85]">
                          {w?.details[0].bestBlockHeight?.toLocaleString(
                            "en-US"
                          ) || "Syncing..."}
                        </span>
                      </div>
                    </div>,
                  ]}
                  contents={[<>{contents}</>]}
                  showTitleIcon={!!contents.length}
                />
              );
            })
          )}
        </div>
        {showForm && <Send showForm={showForm} setShowForm={setShowForm} />}

        <footer className="footer">
          <div className="tab-container">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`tab-button ${selectedTab === tab.id ? "active" : ""
                  }`}
                onClick={(e) => handleTabClick(tab.id, e)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </footer>
        {selectedTab === "Assets" && renderAssets()}
        {selectedTab === "NFTs" && renderNFTs()}
        {selectedTab === "Activities" && renderActivities()}
      </main>
    </>
  );
};

export default Popup;
