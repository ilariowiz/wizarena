import React, { Component } from 'react'
import { connect } from 'react-redux'
import { collection, getDocs } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import calcMedals from './common/CalcMedals'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadAllNftsIds
} from '../actions'

const cup_gold = require('../assets/cup_gold.png')
const cup_silver = require('../assets/cup_silver.png')
const cup_bronze = require('../assets/cup_bronze.png')
const medal = require('../assets/medal.png')


class League extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ranking: [],
            loading: true,
            error: "",
            tournament: {}
        }
    }

    componentDidMount() {
		document.title = "The Twelve League - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

		setTimeout(() => {
			this.loadAll()
            this.loadTournament()
		}, 500)

	}

    async loadTournament() {
        const querySnapshot = await getDocs(collection(firebasedb, "stage"))

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
			const tournament = doc.data()
            this.setState({ tournament })
        })
    }

    loadAll() {
		const { chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

        this.props.loadAllNftsIds(chainId, gasPrice, gasLimit, networkUrl, (res) => {

            //console.log(res);

            let places = {}

            for (let i = 0; i < res.length; i++) {
                let nft = res[i]

                const medals = calcMedals(nft)

                if (medals["s2"]) {
                    nft["totMedals"] = parseInt(medals["s2"])

                    if (!places[`${medals["s2"]}`] && Object.keys(places).length < 12) {
                        places[`${medals["s2"]}`] = []
                    }

                    if (places[`${medals["s2"]}`]) {
                        places[`${medals["s2"]}`].push(nft)
                    }
                }
            }

            let sorted = []

            Object.keys(places)
                    .sort((a, b) => {
                        return b - a
                    })
                    .forEach((v, k) => {
                        sorted.push(places[parseInt(v)])
                    })

            //console.log(sorted);

            this.setState({ ranking: sorted, loading: false })

        })
	}

    renderSingleCard(item, index, widthNft) {

        //console.log(item);

        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                style={styles.boxImage}
                key={item.id}
                onClick={(e) => {
                    e.preventDefault()
                    this.props.history.push(`/nft/${item.id}`)
                }}
            >
                <img
                    src={getImageUrl(item.id)}
                    style={{ width: widthNft, height: widthNft, borderWidth: 1, borderColor: 'white', borderRadius: 2, borderStyle: "solid" }}
                    alt={`#${item.id}`}
                />
                <p style={{ fontSize: 16, color: 'white', marginTop: 5 }}>
                    {item.name}
                </p>
            </a>
        )
    }

    renderBox(items, index, boxW, isMobile) {

        let img;
        let wImg;
        let borderColor
        let nMedals = items[0].totMedals

        if (index === 0) {
            img = cup_gold
            wImg = 90
            borderColor = '#ffd700'
        }

        if (index === 1) {
            img = cup_silver
            wImg = 90
            borderColor = '#c0c0c0'
        }

        if (index === 2) {
            img = cup_bronze
            wImg = 90
            borderColor = "#cd7f32"
        }

        if (index > 2) {
            img = medal
            wImg = 60
            borderColor = "#cd7f32"
        }

        let widthNft = (boxW - 100) / items.length;
        if (widthNft < 75) {
            widthNft = 75
        }
        else if (widthNft > 200) {
            widthNft = 200
        }

        //console.log(items);

        const rowStyle = isMobile ? { flexDirection: 'column' } : { flexDirection: 'row' }
        const cardsStyle = isMobile ? { justifyContent: 'center', flexWrap: 'wrap' } : { flexWrap: 'wrap', marginRight: 10 }

        return (
            <div style={Object.assign({}, styles.row, { borderColor }, rowStyle)} key={index}>

                <div style={{ marginRight: 10, marginLeft: 10, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: isMobile ? 15 : 0 }}>

                    <div style={{ width: 90, height: 90, marginBottom: 10, justifyContent: 'center', alignItems: 'center' }}>
                        <img
                            src={img}
                            style={{ width: wImg, height: wImg }}
                            alt='cup'
                        />
                    </div>

                    <p style={{ fontSize: 30, color: borderColor, marginLeft: 9 }}>
                        {nMedals}
                    </p>
                    <p style={{ fontSize: 18, color: borderColor, marginLeft: 9 }}>
                        MEDALS
                    </p>
                </div>

                <div style={cardsStyle}>
                    {items.map((item, index) => {
                        return this.renderSingleCard(item, index, widthNft)
                    })}
                </div>

            </div>
        )
    }


    renderBody(isMobile) {
        const { loading, error, ranking, tournament } = this.state

        const { boxW } = getBoxWidth(isMobile)

        return (
            <div style={{ width: boxW, alignItems: 'center', flexDirection: 'column', paddingTop: 30 }}>

                <div style={{ marginBottom: 10, alignItems: 'center' }}>
                    <p style={{ fontSize: 32, color: 'white', marginRight: 10 }}>
                        The Twelve League
                    </p>

                    {
                        tournament && tournament.leagueTournament &&
                        <p style={{ fontSize: 22, color: 'white' }}>
                            ({tournament.leagueTournament})
                        </p>
                    }
                </div>

                <p style={{ fontSize: 24, color: 'white', marginBottom: 30 }}>
                    Ranking
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexDirection: 'column' }}>
                    {ranking.map((items, index) => {
                        return this.renderBox(items, index, boxW, isMobile)
                    })}
                </div>

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div style={{ width: '100%' }}>
				<Header
					page='home'
					section={6}
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
    row: {
        alignItems: 'center',
        width: '100%',
        justifyContent: 'space-between',
        paddingTop: 10,
        borderRadius: 2,
        borderWidth: 2,
        borderStyle: 'solid',
        marginBottom: 20
    },
    boxImage: {
        marginLeft: 10,
        marginBottom: 10,
        flexDirection: 'column',
        alignItems: 'center',
        display: 'flex',
        cursor: 'pointer'
    }
}

const mapStateToProps = (state) => {
    const { chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer

    return { chainId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    setNetworkUrl,
    setNetworkSettings,
    loadAllNftsIds
})(League)
