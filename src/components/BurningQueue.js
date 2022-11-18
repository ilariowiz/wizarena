import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { getDocs, collection, query, where } from "firebase/firestore";
import { firebasedb } from './Firebase';
import moment from 'moment'
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import NftCardBurningQueue from './common/NftCardBurningQueue'
import getBoxWidth from './common/GetBoxW'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadBurningNftInfo,
    getBurningQueue
} from '../actions'
import '../css/Nft.css'


class BurningQueue extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            queue: [],
            burned: []
        }
    }

    componentDidMount() {
		document.title = "Burning Queue - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadQueue()
            this.loadBurned()
        }, 500)

	}

    async loadQueue() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getBurningQueue(chainId, gasPrice, gasLimit, networkUrl, (response) => {

            response.sort((a, b) => {
                //console.log(moment(b.timestamp.timep));
                return moment(b.timestamp.timep) - moment(a.timestamp.timep)
            })

            this.setState({ queue: response, loading: false })
        })


	}

    async loadBurned() {
        let q = query(collection(firebasedb, "nft_burned"))

        const querySnapshot = await getDocs(q)

        let burned = []
        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            const d = doc.data()

            burned.push(d)
        })

        //console.log(burned[0].timestamp);
        burned.sort((a ,b) => {
            return moment(b.timestamp.seconds * 1000) - moment(a.timestamp.seconds * 1000)
        })
        //console.log(burned);

        this.setState({ burned })
    }

    renderNft(item, index, isBurned) {

        return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCardBurningQueue
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={260}
                    isBurned={isBurned}
                />
            </div>
		)
    }

    renderBody(isMobile) {
        const { loading, queue, burned } = this.state

        const { boxW } = getBoxWidth(isMobile)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 28, color: 'white', marginBottom: 5 }}>
                    Burning Queue
                </p>
                <p style={{ fontSize: 16, color: '#c2c0c0', marginBottom: 30 }}>
                    in real time
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexWrap: 'wrap', marginBottom: 50 }}>
                    {queue.map((item, index) => {
                        return this.renderNft(item, index, false)
                    })}
                </div>

                <p style={{ fontSize: 28, color: 'white', marginBottom: 30 }}>
                    Burned NFTs ({burned.length})
                </p>

                <div style={{ width: '100%', flexWrap: 'wrap', marginBottom: 50 }}>
                    {burned.map((item, index) => {
                        return this.renderNft(item, index, true)
                    })}
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='nft'
					section={32}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={styles.container}>
				<Media
					query="(max-width: 767px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderTopHeader(false)}
				/>

				<Media
					query="(max-width: 767px)"
					render={() => this.renderBody(true)}
				/>

				<Media
					query="(min-width: 768px)"
					render={() => this.renderBody(false)}
				/>
			</div>
		)
	}
}

const styles = {
    container: {
		flexDirection: 'column',
		alignItems: 'center',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadBurningNftInfo,
    getBurningQueue
})(BurningQueue)
