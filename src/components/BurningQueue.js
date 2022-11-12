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
    loadBurningNftInfo
} from '../actions'
import '../css/Nft.css'


class BurningQueue extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            queue: []
        }
    }

    componentDidMount() {
		document.title = "Burning Queue - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadQueue()
        }, 500)

	}

    async loadQueue() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        let q = query(collection(firebasedb, "burning_queue"))

        const querySnapshot = await getDocs(q)

        let queue = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            const d = doc.data()
            queue = JSON.parse(d.queue)
        })

        queue.sort((a, b) => {
            return moment(b.timestamp) - moment(a.timestamp)
        })

        //console.log(queue);

        this.setState({ queue, loading: false })
	}

    renderNft(item, index) {

        return (
            <div style={{ marginBottom: 15 }} key={index}>
                <NftCardBurningQueue
                    item={item}
                    key={index}
                    history={this.props.history}
                    width={260}
                />
            </div>
		)
    }

    renderBody(isMobile) {
        const { loading, queue } = this.state

        const { boxW } = getBoxWidth(isMobile)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>
                <p style={{ fontSize: 28, color: 'white', marginBottom: 5 }}>
                    Burning Queue
                </p>
                <p style={{ fontSize: 16, color: '#c2c0c0', marginBottom: 30 }}>
                    updated once a day
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexWrap: 'wrap' }}>
                    {queue.map((item, index) => {
                        return this.renderNft(item, index)
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
    loadBurningNftInfo
})(BurningQueue)
