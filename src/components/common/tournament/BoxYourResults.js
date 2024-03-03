import React, { Component } from 'react'
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import { collection, getDocs, query, where } from "firebase/firestore";
import { firebasedb } from '../../Firebase';
import CardSingleFightProfile from '../CardSingleFightProfile'
import getImageUrl from '../GetImageUrl'
import {
    getSubscriptions
} from '../../../actions'

class BoxYourResults extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            profileFights: {},
            error: ""
        }
    }

    componentDidMount() {
        this.loadYourSubs()
    }

    loadYourSubs() {
        const { chainId, gasPrice, gasLimit, networkUrl, userMintedNfts, tournament } = this.props

        let idsSubscription = []
        const tName = tournament.name.split("_")[0]

        userMintedNfts.map(i => {
            idsSubscription.push(`${tName}_${i.id}`)
        })

        this.props.getSubscriptions(chainId, gasPrice, gasLimit, networkUrl, idsSubscription, (subscriptions) => {
            //console.log(subscriptions);

            let subscribed = []
            subscriptions.map(i => {
                if (i.idnft) {
                    subscribed.push(i.idnft)
                }
            })

            //console.log(subscribed);

            this.loadProfileFights(subscribed)
        })
    }

    async loadProfileFights(subscribed) {
        const { tournament } = this.props

		const tournamentName = tournament.name.split("_")[0]
		//console.log(tournamentName);

        //subscribed = ["63", "68", "94", "143", "171", "194", "226", "235", "289", "342", "388", "428", "582", "584", "611", "649", "714", "765", "803", "820", "890", "917", "952"]
        //subscribed = ["63", "68"]

        let tournamentsKey = []
        for (var i = 1; i < 7; i++) {
            let tKey = `${tournamentName}_r${i}`
            tournamentsKey.push(tKey)
        }

        let q2 = query(collection(firebasedb, "fights"), where("tournament", "in", tournamentsKey))

        Promise.resolve(getDocs(q2)).then(values => {

            let results = []

            values.forEach(doc => {
                //console.log(doc);
                let d = doc.data()
                //console.log(d, subscribed);

                if (subscribed.includes(d.idnft1) || subscribed.includes(d.idnft2)) {

                    const idnft = subscribed.includes(d.idnft1) ? d.idnft1 : d.idnft2

                    const obj = {
                        fightId: doc.id,
                        tournament: d.tournament,
                        winner: d.winner,
                        id: idnft,
                        name: `#${idnft}`
                    }

                    results.push(obj)
                }
            })

            results.sort((a, b) => {
                if (parseInt(a.tournament[a.tournament.length - 1]) === 0) return 1;
                if (parseInt(b.tournament[b.tournament.length - 1]) === 0) return -1
                return parseInt(a.tournament[a.tournament.length - 1]) - parseInt(b.tournament[b.tournament.length - 1])
            })

            //console.log(profileFights);

            let fightsPerRound = {}

            for (var i = 0; i < results.length; i++) {
                const singleF = results[i]

                if (!fightsPerRound[singleF.tournament]) {
                    fightsPerRound[singleF.tournament] = []
                }

                fightsPerRound[singleF.tournament].push(singleF)
            }

            //console.log(fightsPerRound);

            this.setState({ profileFights: fightsPerRound, loading: false, showProfileFights: true })
        })
	}

    renderRoundFights(key) {
		const { profileFights } = this.state

		const roundName = key.split("_")[1].replace("r", "")
		const fights = profileFights[key]

		return (
			<div style={{ flexDirection: 'column' }} key={key}>
				<p style={{ fontSize: 20, color: this.props.mainTextColor, marginBottom: 15 }} className="text-medium">
					Round {roundName}
				</p>

				<div style={{ flexWrap: 'wrap' }}>
					{fights && fights.map((item, index) => this.renderSingleFight(item, index))}
				</div>
			</div>
		)
	}

    renderSingleFight(item, index) {
		return (
			<CardSingleFightProfile
				history={this.props.history}
				userMintedNfts={this.props.userMintedNfts}
				item={item}
				key={index}
			/>
		)
	}

    render () {
        const { profileFights, loading, error } = this.state
        const { mainTextColor } = this.props

        return (
            <div style={{ flexDirection: 'column', width: "100%" }}>

                {
                    loading ?
                    <div style={{ width: "100%", height: 50, marginBottom: 30, justifyContent: 'center', alignItems: 'center' }}>
                        <DotLoader size={25} color={mainTextColor} />
                    </div>
                    : null
                }

                <div style={{ marginBottom: 30, flexWrap: 'wrap' }}>
                    {profileFights && Object.keys(profileFights).length > 0 && Object.keys(profileFights).reverse().map(key => this.renderRoundFights(key))}
                </div>

                <p style={{ fontSize: 15, color: 'red', marginTop: 10 }}>
                    {error}
                </p>
            </div>
        )
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor } = state.mainReducer;

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor };
}

export default connect(mapStateToProps, {
    getSubscriptions
})(BoxYourResults)
