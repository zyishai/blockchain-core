const Topology = require('fully-connected-topology')
const {
    stdin,
    exit,
    argv
} = process
const {
    log
} = console
// const {
//     me,
//     peers
// } = extractPeersAndMyPort()
const sockets = {}

// const myIp = toLocalIp(me)
// const peerIps = getPeerIps(peers)

/**
 * Connect to peers.
 * 
 * @param {String} me my port
 * @param {String[]} peers my peers ports
 * @returns {Topology}
 */
const createTopology = (wallet, me, peers) => {
        log('---------------------');
        log('Welcome to p2p blockchain network!');
        log('me - ', me);
        log('my name - ', wallet.name);
        log('peers - ', peers);
        log('connecting to peers...');

        return Topology(toLocalIp(me), getPeerIps(peers)).on('connection', (socket, peerIp) => {
            const peerPort = extractPortFromIp(peerIp)
            log('connected to peer - ', peerPort)

            sockets[peerPort] = socket
            stdin.on('data', data => { //on user input
                const message = data.toString().trim()
                if (message === 'exit') { //on exit
                    log('Bye bye')
                    exit(0)
                }

                broadcast(`${wallet.name}:${message}`);

                // const receiverPeer = extractReceiverPeer(message)
                // if (sockets[receiverPeer]) { //message to specific peer
                //     if (peerPort === receiverPeer) { //write only once
                //         sockets[receiverPeer].write(extractMessageToSpecificPeer(message))
                //     }
                // } else { //broadcast message to everyone
                //     socket.write(message)
                // }
            })

            //print data when received
            // socket.on('data', data => log(data.toString('utf8')))
            socket.on('data', message => wallet.handleIncomingMessage(message));
    });
}

//extract ports from process arguments, {me: first_port, peers: rest... }
function extractPeersAndMyPort() {
    return {
        me: argv[3],
        peers: argv.slice(4, argv.length)
    }
}

//'4000' -> '127.0.0.1:4000'
function toLocalIp(port) {
    return `127.0.0.1:${port}`
}

//['4000', '4001'] -> ['127.0.0.1:4000', '127.0.0.1:4001']
function getPeerIps(peers) {
    return peers.map(peer => toLocalIp(peer))
}

//'hello' -> 'myPort:hello'
function formatMessage(message) {
    return `${me}>${message}`
}

//'127.0.0.1:4000' -> '4000'
function extractPortFromIp(peer) {
    return peer.toString().slice(peer.length - 4, peer.length);
}

//'4000>hello' -> '4000'
function extractReceiverPeer(message) {
    return message.slice(0, 4);
}

//'4000>hello' -> 'hello'
function extractMessageToSpecificPeer(message) {
    return message.slice(5, message.length);
}

function broadcast(message) {
    Object.keys(sockets).forEach(key => sockets[key].write(message));
}

module.exports.createTopology = createTopology;
module.exports.extractPeersAndMyPort = extractPeersAndMyPort;
module.exports.broadcast = broadcast;