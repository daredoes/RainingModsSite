import React from "react"
import { connect } from "net";
import moment from "moment"

export function makeMessage(message, action, data) {
    return JSON.stringify({
        message: message,
        action: action || 'info',
        data: data
    });
}

export function readMessage(message) {
    return JSON.parse(message);
}

/*
 * The reason we use Global State instead of Component State is that
 * when the user clicks something on the main page and then clicks back,
 * we don't want to reset the user's scroll position. If we don't maintain
 * state, then we will "lose" some of the items when the user clicks
 * back and the state resets, which obviously resets scroll position as well.
 */
export const GlobalStateContext = React.createContext({
    items: null,
    isLoading: true,
    cursor: 0, /* Which page infinite scroll should fetch next. */
    useInfiniteScroll: true, /* Toggle between pagination and inf. scroll for this demo & fallback in case of error. */
    updateState: () => {},
    hasMore: () => {},
    loadMore: () => {},
    toggle: () => {},
    rootFolder: null,
    updateRootFolder: () => {},
    repositoryMap: {},
    user: null,
    sendMessage: () => {},
    lookForClientNow: () => {},
    sortItemsByDate: () => {},
    sortItemsByFunc: () => {},
    lookForClient: true,
    lookForClientTimer: null,
    lookForClientTimeout: 5000
});

export class GlobalState extends React.Component {

    constructor(props) {
        super(props)

        console.log("*** Constructing Global State ***")

        this.toggle = this.toggle.bind(this)
        this.loadMore = this.loadMore.bind(this)
        this.hasMore = this.hasMore.bind(this)
        this.updateState = this.updateState.bind(this)
        this.updateRootFolder = this.updateRootFolder.bind(this)
        this.sendMessage = this.sendMessage.bind(this)
        this.lookForClient = this.lookForClient.bind(this)
        this.sortItemsByDate = this.sortItemsByDate.bind(this)
        this.sortItemsByFunc = this.sortItemsByFunc.bind(this)

        this.state = {
            items: null,
            isLoading: true,
            cursor: 0,
            useInfiniteScroll: true,
            updateState: this.updateState,
            hasMore: this.hasMore,
            loadMore: this.loadMore,
            toggle: this.toggle,
            updateRootFolder: this.updateRootFolder,
            socket: null,
            user: null,
            repositoryMap: {},
            sendMessage: this.sendMessage,
            lookForClientNow: this.lookForClient,
            sortItemsByDate: this.sortItemsByDate,
            sortItemsByFunc: this.sortItemsByFunc,
            lookForClient: true,
            lookForClientTimer: null,
            lookForClientTimeout: 5000
        }
    }

    updateRootFolder = (root) => {
        if (this.state.socket) {
            this.state.socket.send(makeMessage('entered by user', 'updateRootFolder', {folder: root}))
        }
    }

    sendMessage = (message, action, data) => {
        if (this.state.socket && this.state.socket.readyState == 1 && action) {
            this.state.socket.send(makeMessage(message, action, data))
        }
    }

    messageReceived = (event) => {
        let data = readMessage(event.data);
        if (data.action === 'update' && data.data && data.data.user) {
            this.setState({
                user: JSON.parse(data.data.user)
            })
        }
    }

    socketOpened = (event) => {
        clearInterval(this.state.lookForClientTimer);
        this.setState({
            lookForClientTimer: false
        });
    }

    socketClosed = (event) => {
        let lookForClientTimer = this.state.lookForClient ? setInterval(this.lookForClient, this.state.lookForClientTimeout) : null;
        this.setState({
            user: null,
            socket: null,
            lookForClientTimer: lookForClientTimer
        })

    }

    lookForClient = () => {
        if (typeof WebSocket !== `undefined`) {
            if (this.state.lookForClientTimer) {
                if (this.state.socket && this.state.socket.readyState < 2) {
                    clearInterval(this.state.lookForClientTimer);
                    this.setState({
                        lookForClientTimer: false
                    });
                } else {
                    const socket = new WebSocket('ws://localhost:13254');
                    socket.addEventListener('open', this.socketOpened);
                    socket.addEventListener('close', this.socketClosed);
                    socket.addEventListener('error', (event) => {console.log(event)});
                    socket.addEventListener('message', this.messageReceived);
                    this.setState({
                        socket: socket
                    })
                }
            }
        }
    }

    
    componentWillMount() {
        this.setState({
            lookForClientTimer: setInterval(this.lookForClient, this.state.lookForClientTimeout)
        });
    }

    componentWillUnmount() {
        if (this.state.socket) {
            this.state.socket.close();
            this.setState({
                socket: null
            })
        }
    }

    componentDidUpdate() {
        console.log("Showing " + this.state.items.length + " mods.")
    }

    updateState = (mergeableStateObject) => {
        this.setState(mergeableStateObject)
    }

    sortItemsByDate = (descending) => {
        const direction = descending ? 1 : -1;
        let items = this.state.items 
        items.sort((a, b) => {
            const aTime = moment(a.releases.edges[0].node.updatedAt);
            const bTime = moment(b.releases.edges[0].node.updatedAt);
            if (aTime < bTime) {
                return 1 * direction;
            } else if (aTime > bTime) {
                return -1 * direction;
            } else {
                return 0;
            }
        });
        this.setState({
            items: items
        })
    }

    sortItemsByFunc = (func) => {
        let items = this.state.items;
        items.sort(func);
        this.setState({
            items: items
        })
    }

    loadMore = () => {
        this.setState({ isLoading: true, error: undefined })
        console.log("Loading more...")
        fetch(`/paginationJson/index${this.state.cursor}.json`)
          .then(res => res.json())
          .then(
            res => {
              this.setState(state => ({
                items: [...state.items, ...res], // Add resulting post items to state.items
                cursor: state.cursor+1, // Update which page should be fetched next
                isLoading: false // Loading is complete so a new load can be triggered.
              }))
            },
            error => {
              this.setState({
                isLoading: false,
                error,
                useInfiniteScroll: false // Fallback to Pagination on error.
              })
            }
        )
    }

    hasMore = (pageContext) => {
        return (this.state.cursor <= pageContext.countPages && this.state.useInfiniteScroll)
    }

    /** This exists to demo toggling. You will not need this in production. */
    toggle(useInfiniteScroll, pageContext) {
        if (useInfiniteScroll) {
            /* When we toggle back to infinite scroll, adjust scroll position. Otherwise we might load 1000s of items at once. */
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            window.scrollTo(0, scrollTop-1);
            this.setState({
                useInfiniteScroll: true
            })
        } else {
            /* When we toggle back to pagination, reset items and cursor. */
            this.setState({
                useInfiniteScroll: false,
                items: pageContext.pageMods,
                cursor: pageContext.currentPage+1,
            })
        }
    }

    render() {
        return (
            <GlobalStateContext.Provider value={this.state}>
                {this.props.children}
            </GlobalStateContext.Provider>
        )
    }

}