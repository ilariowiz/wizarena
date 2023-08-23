import React, { Component } from 'react'
import { connect } from 'react-redux'
import { collection, getDocs, query, where, documentId } from "firebase/firestore";
import { firebasedb } from '../components/Firebase';
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import { BsChevronDoubleDown, BsChevronDoubleUp } from 'react-icons/bs'
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
//import calcMedals from './common/CalcMedals'
import { TEXT_SECONDARY_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadAllNftsIds,
    loadUserMintedNfts
} from '../actions'

const cup_gold = require('../assets/cup_gold.png')
const cup_silver = require('../assets/cup_silver.png')
const cup_bronze = require('../assets/cup_bronze.png')
const medal = require('../assets/medal.png')

const LEAGUE_NAME = "ranking_s4"


class League extends Component {
    constructor(props) {
        super(props)

        this.state = {
            ranking: [],
            loading: true,
            error: "",
            tournament: {},
            yourNftsRanking: [],
            loadingYourRanking: true
        }
    }

    componentDidMount() {
        const { allNfts, userMintedNfts } = this.props

		document.title = "League - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            if (!allNfts) {
                this.loadAllNfts()
            }

            if (!userMintedNfts) {
                this.loadMinted()
            }
		}, 500)



        this.loadTournament()
	}

    loadAllNfts() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.loadAllNftsIds(chainId, gasPrice, gasLimit, networkUrl)
    }

    async loadMinted() {
        const { chainId, gasPrice, gasLimit, networkUrl, account } = this.props

        this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, async (response) => {

            let onlyIds = []
            response.map(i => onlyIds.push(i.id))

            const onlyIdsBy10 = onlyIds.reduce((rows, item, index) => {
				//console.log(index);
				//se array row è piena, aggiungiamo una nuova row = [] alla lista
				if (index % 10 === 0 && index > 0) {
					rows.push([]);
				}

				//prendiamo l'ultima array della lista e aggiungiamo item
				rows[rows.length - 1].push(item);
				return rows;
			}, [[]]);

            //console.log(onlyIdsBy10);

            let yourNftsRanking = []

            await Promise.all(
				onlyIdsBy10.map(async (chunks) => {
					const results = await getDocs(
						query(
							collection(firebasedb, LEAGUE_NAME),
							where(documentId(), 'in', chunks)
						)
					)

					return results.docs.map(doc => {
						//console.log(doc.id);
						const data = doc.data()
                        //console.log(data);

                        const obj = { id: doc.id, ...data }

                        yourNftsRanking.push(obj)

					})
				})
			)

            //console.log(yourNftsRanking);

            yourNftsRanking.sort((a, b) => {
                return b.ranking - a.ranking
            })

            this.setState({ yourNftsRanking, loadingYourRanking: false })
        })
    }

    async loadTournament() {
        const queryT = await getDocs(collection(firebasedb, "stage_low"))

        queryT.forEach(doc => {
			const tournament = doc.data()
            this.setState({ tournament })
        })

        const querySnapshot = await getDocs(collection(firebasedb, LEAGUE_NAME))

        let rankings = []

        querySnapshot.forEach(doc => {
            //console.log(doc.data());
            const idDoc = doc.id
			const data = doc.data()

            //console.log(idDoc, data);

            rankings.push({ id: idDoc, ranking: data.ranking, oldRanking: data.oldRanking })
        })

        //se non ci sono ancora dati ***************************
        if (rankings.length <= 1) {
            this.setState({ ranking: [], loading: false })
            return
        }

        rankings.sort((a, b) => {
            return b.ranking - a.ranking
        })

        let rankings2 = []

        for (let i = 0; i < rankings.length; i++) {
            const r = rankings[i]

            if (i < 30) {
                rankings2.push(r)
                continue
            }

            if (r.ranking === rankings[i-1].ranking) {
                //console.log(r.ranking, rankings[i-1].ranking);
                rankings2.push(r)
            }
            else {
                break
            }
        }

        //console.log(rankings2);

        let onlyIds = []
        rankings2.map(i => onlyIds.push(i.id))

        let finalRankings = []

        for (let i = 0; i < rankings2.length; i++) {
            const r = rankings2[i]

            if (finalRankings.length === 0) {
                finalRankings.push([r])
                continue
            }

            let latestSubArray = finalRankings[finalRankings.length - 1]
            //console.log(latestSubArray);
            let latestRanking = latestSubArray[latestSubArray.length - 1]

            //console.log(latestRanking.ranking, r.ranking);

            if (latestRanking.ranking === r.ranking) {
                latestSubArray.push(r)
            }
            else {
                finalRankings.push([r])
            }
        }

        //console.log(finalRankings);

        let final2 = []

        let places = 0

        finalRankings.map((items, index) => {
            places = items.length + places
            const placesString = items.length === 1 ? `${places}${this.getOrdinal(places)} place` : `${places - items.length + 1}${this.getOrdinal(places - items.length + 1)} to ${places}${this.getOrdinal(places)} places`
            const obj = { ranking: placesString, nfts: items }
            final2.push(obj)
        })

        //console.log(final2);

        this.setState({ ranking: final2, loading: false })

    }

    getOrdinal(n) {
        let ord = "th"

        if (n % 10 === 1 && n % 100 !== 11) {
            ord = 'st';
        }
        else if (n % 10 === 2 && n % 100 !== 12) {
            ord = 'nd';
        }
        else if (n % 10 === 3 && n % 100 !== 13) {
            ord = 'rd';
        }

        return ord
    }

    renderSingleCard(item, index, widthNft) {
        const { account, mainTextColor, allNfts, userMintedNfts } = this.props

        //console.log(allNfts);

        //console.log(item);
        let isOwner = false

        let nickname;

        if (allNfts) {
            const nft = allNfts.find(i => i.id === item.id)
            if (nft && nft.nickname) {
                nickname = nft.nickname
            }
        }

        if (userMintedNfts) {
            const nft = userMintedNfts.find(i => i.id === item.id)
            if (nft) {
                isOwner = true
            }
        }

        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                style={Object.assign({}, styles.boxImage, { borderColor: isOwner ? "gold" : "#d7d7d7" })}
                key={item.id}
                onClick={(e) => {
                    e.preventDefault()
                    this.props.history.push(`/nft/${item.id}`)
                }}
            >
                <img
                    src={getImageUrl(item.id)}
                    style={{ width: widthNft, height: widthNft, borderWidth: 1, borderColor: "#d7d7d7", borderRadius: 4, borderStyle: "solid" }}
                    alt={`#${item.id}`}
                />
                <p style={{ fontSize: 14, color: mainTextColor, marginTop: 5, marginBottom: 5, maxWidth: widthNft, textAlign: 'center' }}>
                    #{item.id} {nickname || ""}
                </p>

                {
                    item.oldRanking &&
                    <div style={{ alignItems: 'center', marginBottom: 5 }}>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 5 }}>
                            Old ranking:
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 3 }}>
                            {item.oldRanking}
                        </p>

                        {
                            item.oldRanking > item.ranking &&
                            <BsChevronDoubleDown
                                color='red'
                                size={17}
                            />
                        }

                        {
                            item.oldRanking < item.ranking &&
                            <BsChevronDoubleUp
                                color='green'
                                size={17}
                            />
                        }
                    </div>
                }
            </a>
        )
    }

    renderYourSingleCard(item, index, widthNft) {
        const { account, mainTextColor, userMintedNfts } = this.props

        //console.log(allNfts);

        //console.log(item);
        let nickname;

        if (userMintedNfts) {
            const nft = userMintedNfts.find(i => i.id === item.id)
            if (nft && nft.nickname) {
                nickname = nft.nickname
            }
        }

        return (
            <a
                href={`${window.location.protocol}//${window.location.host}/nft/${item.id}`}
                style={Object.assign({}, styles.boxImage, { borderColor: "gold" })}
                key={item.id}
                onClick={(e) => {
                    e.preventDefault()
                    this.props.history.push(`/nft/${item.id}`)
                }}
            >
                <img
                    src={getImageUrl(item.id)}
                    style={{ width: widthNft, height: widthNft, borderWidth: 1, borderColor: "#d7d7d7", borderRadius: 4, borderStyle: "solid" }}
                    alt={`#${item.id}`}
                />
                <p style={{ fontSize: 14, color: mainTextColor, marginTop: 5, marginBottom: 5, maxWidth: widthNft, textAlign: 'center' }}>
                    #{item.id} {nickname || ""}
                </p>

                <p style={{ fontSize: 14, color: mainTextColor, marginBottom: 5 }}>
                    Ranking: {item.ranking}
                </p>

                {
                    item.oldRanking &&
                    <div style={{ alignItems: 'center', marginBottom: 5 }}>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 5 }}>
                            Old ranking:
                        </p>

                        <p style={{ fontSize: 14, color: mainTextColor, marginRight: 3 }}>
                            {item.oldRanking}
                        </p>

                        {
                            item.oldRanking > item.ranking &&
                            <BsChevronDoubleDown
                                color='red'
                                size={17}
                            />
                        }

                        {
                            item.oldRanking < item.ranking &&
                            <BsChevronDoubleUp
                                color='green'
                                size={17}
                            />
                        }
                    </div>
                }
            </a>
        )
    }

    renderBox(items, index, boxW, isMobile) {

        //console.log(items);

        let img;
        let wImg;
        let borderColor
        let nPoints = items.nfts[0].ranking

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

        let widthNft = (boxW - 100) / items.nfts.length;
        if (widthNft < 75) {
            widthNft = 75
        }
        else if (widthNft > 200) {
            widthNft = 200
        }

        //console.log(items);

        let sortedItems = items.nfts.sort((a, b) => {
            return parseInt(a.id) - parseInt(b.id)
        })

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

                    <p style={{ fontSize: 24, color: borderColor, marginLeft: 9 }} className="text-bold">
                        {nPoints}
                    </p>
                    <p style={{ fontSize: 16, color: borderColor, marginLeft: 9 }}>
                        points
                    </p>

                    <p style={{ fontSize: 16, color: borderColor, marginLeft: 9, width: 100, textAlign: 'center' }} className="text-bold">
                        {items.ranking}
                    </p>
                </div>

                <div style={cardsStyle}>
                    {sortedItems.map((item, index) => {
                        return this.renderSingleCard(item, index, widthNft)
                    })}
                </div>

            </div>
        )
    }


    renderBody(isMobile) {
        const { loading, error, ranking, tournament, yourNftsRanking, loadingYourRanking } = this.state
        const { mainTextColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        let ligueTitle = tournament.type === "apprentice" ? "The Apprentice League" : "The Twelve League"

        return (
            <div style={{ flexDirection: 'column', width: boxW, alignItems: 'center', padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ marginBottom: 10, alignItems: 'center' }}>
                    <p style={{ fontSize: 24, color: mainTextColor, marginRight: 10 }}>
                        {ligueTitle}
                    </p>

                    {
                        tournament && tournament.leagueTournament &&
                        <p style={{ fontSize: 16, color: mainTextColor }}>
                            ({tournament.leagueTournament})
                        </p>
                    }
                </div>

                <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 30 }}>
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
                    {
                        ranking && ranking.length > 0 ?
                        ranking.map((items, index) => {
                            return this.renderBox(items, index, boxW, isMobile)
                        })
                        :
                        null
                    }

                    {
                        ranking.length === 0 && !loading &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }}>
                            No data available
                        </p>
                    }
                </div>

                <div style={{ width: '100%', flexDirection: 'column', marginTop: 30 }}>

                    <p style={{ color: mainTextColor, fontSize: 20, marginBottom: 10 }}>
                        Your Wizards
                    </p>

                    {
                        yourNftsRanking && yourNftsRanking.length > 0 ?

                        <div style={{ alignItems: 'center', flexWrap: 'wrap' }}>
                            {yourNftsRanking.map((item, index) => {
                                return this.renderYourSingleCard(item, index, 200)
                            })}
                        </div>
                        :
                        null
                    }

                    {
                        yourNftsRanking.length === 0 && !loadingYourRanking &&
                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }}>
                            No data available
                        </p>
                    }
                </div>

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
                        {error}
                    </p>
                }
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
				<Header
					page='home'
					section={7}
					account={account}
					isMobile={isMobile}
					history={this.props.history}
				/>
			</div>
		)
	}

    render() {
		return (
			<div style={Object.assign({}, styles.container, { backgroundColor: this.props.mainBackgroundColor })}>
				<Media
					query="(max-width: 999px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1000px)"
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
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
	},
    row: {
        alignItems: 'center',
        width: '100%',
        paddingTop: 10,
        borderRadius: 4,
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
        cursor: 'pointer',
        borderRadius: 4,
        borderWidth: 1,
        borderStyle: "solid"
    }
}

const mapStateToProps = (state) => {
    const { chainId, gasPrice, gasLimit, networkUrl, account, mainTextColor, mainBackgroundColor, allNfts, userMintedNfts } = state.mainReducer

    return { chainId, gasPrice, gasLimit, networkUrl, account, mainTextColor, mainBackgroundColor, allNfts, userMintedNfts }
}

export default connect(mapStateToProps, {
    setNetworkUrl,
    setNetworkSettings,
    loadAllNftsIds,
    loadUserMintedNfts
})(League)
