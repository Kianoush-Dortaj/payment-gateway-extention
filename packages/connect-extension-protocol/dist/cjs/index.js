"use strict";
/**
 *
 * This module contains the types and explanations of the communication
 * protocol between the JavaScript code embedded in a web page and the
 * substrate-connect extension.
 *
 * # Overview
 *
 * If a web page wants to use the features of the substrate-connect extension,
 * it must first check whether the extension is available by checking whether
 * there exists an element on the DOM whose `id` is equal to
 * {@link DOM_ELEMENT_ID}. This DOM element is automatically inserted by
 * the extension when the page loads.
 *
 * If so, the web page can make use of the extension by sending messages on
 * its `window` by using `Window.postMessage`. These messages must conform to
 * the {@link ToExtension} interface defined below.
 *
 * The substrate-connect extension (more precisely, its content-script) listens
 * for "message" events (using `window.addEventListener("message", ...)`) and
 * replies by sending back messages using `Window.postMessage` as well. The
 * messages sent by the extension conform to the {@link ToApplication}
 * interface defined below.
 *
 * # Detailed usage
 *
 * In order to ask the substrate-connect extension to connect to a certain
 * chain, the web page must:
 *
 * - Randomly generate the so-called `chainId`, a string that will be used
 * to identify this specific chain connection during its lifetime. At least
 * 48 bits of entropy are recommended in order to avoid accidentally
 * generating the same string multiple times.
 * - Send a {@link ToExtensionAddChain} message (using `Window.postMessage`,
 * as explained in the previous section) containing this `chainid` and the
 * specification of the chain to connect to.
 *
 * Instead of a {@link ToExtensionAddChain} message, the web page can
 * alternatively send a {@link ToExtensionAddWellKnownChain} message and pass
 * a chain name recognized by the extension such as "polkadot" or "ksmcc3", in
 * which case the extension will use the chain specification stored internally.
 * Doing so provides multiple advantages such as less bandwidth usage (as the
 * web page doesn't have to download the chain specification), and a faster
 * initialization as the extension is most likely already connected to that
 * chain.
 *
 * After a {@link ToExtensionAddChain} or a
 * {@link ToExtensionAddWellKnownChain} message has been sent, the extension
 * starts connecting to the chain, and later replies by sending back a
 * {@link ToApplicationChainReady} message in case of success, or a
 * {@link ToApplicationError} message in case of failure. This reply might
 * only be sent back after a few seconds or more, and the web page is
 * encouraged to display some kind of loading screen in the meanwhile.
 *
 * Note that the extension reserves the rights to stop supporting a chain that
 * used to be recognized by {@link ToExtensionAddWellKnownChain}. If the web
 * page has sent a {@link ToExtensionAddWellKnownChain} and receives back a
 * {@link ToApplicationError}, it should automatically fall back to
 * downloading the chain specification and sending a
 * {@link ToExtensionAddChain} instead.
 *
 * After a chain has been successfully initialized (i.e. a
 * {@link ToApplicationChainReady} message has been sent to the web page), the
 * web page can submit JSON-RPC requests and notifications to the chain client
 * by sending {@link ToExtensionRpc} messages. The chain client sends back
 * JSON-RPC responses and notifications using {@link ToApplicationRpc}
 * messages.
 *
 * Once a web page no longer wants to interface with a certain chain, it should
 * send a {@link ToExtensionRemoveChain} message to the extension in order for
 * resources to be de-allocated. This can also be done before a
 * {@link ToApplicationChainReady} message has been sent back.
 *
 * At any point in time after the chain has been initialized, the extension
 * can send a {@link ToApplicationError} message to indicate a critical problem
 * with the chain or the extension that prevents execution from continuing.
 * This can include for example the extension being disabled by the user, the
 * underlying client crashing, an internal error, etc. Contrary to
 * {@link ToApplicationError} messages *before* a chain has been initialized,
 * {@link ToApplicationError} messages that happen *after* a chain has been
 * initialized are rare and serious. If that happens, the web page is
 * encouraged to remove all of its existing chains and stop using the extension
 * altogether.
 *
 * Note that if the extension sends a {@link ToApplicationError} message,
 * either before of after the chain is ready, the corresponding `chainId` is
 * immediately considered dead/removed, and the web page doesn't need to send
 * a {@link ToExtensionRemoveChain} message.
 *
 * # Other extensions implementing this protocol
 *
 * While the documentation above refers to the substrate-connect extension in
 * particular, any other browser extension is free to implement this protocol
 * in order to pretend to be the substrate-connect extension.
 *
 * In order to avoid conflicts when multiple different extensions implement
 * this protocol, extensions must check whether there already exists an element
 * on the DOM whose `id` is equal to {@link DOM_ELEMENT_ID} before
 * creating one and listening for events.
 *
 * @packageDocumentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DOM_ELEMENT_ID = void 0;
// READ THIS BEFORE MODIFYING ANYTHING BELOW
//
// This file contains the communication protocol between the web page and
// extension. If you modify it, existing web pages will still continue to use
// the previous version until they upgrade, which can take a long time.
// Similarly, some users will still have versions of the extension installed
// that use of the previous version of this protocol. If the modifications
// to this protocol aren't done carefully, web pages might no longer being able
// to talk to the extension, or worse: try to talk to the extension and
// throw exceptions because their assumptions are violated. As such, be
// extremely careful when doing modifications: either the modifications are
// completely backwards-compatible, or an upgrade path must be carefully
// planned.
/**
 * `id` of the DOM elemeent automatically inserted by the extension when a web page loads.
 */
exports.DOM_ELEMENT_ID = "substrateConnectExtensionAvailable";
//# sourceMappingURL=index.js.map