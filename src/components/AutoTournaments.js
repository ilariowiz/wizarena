import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import { getDoc, doc, collection } from "firebase/firestore";
import { firebasedb } from './Firebase';
import moment from 'moment'
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import { MdRemoveRedEye } from "react-icons/md";
import getBoxWidth from './common/GetBoxW'
import getImageUrl from './common/GetImageUrl'
import boxPairAutoTournament from './common/tournament/BoxPairAutoTournament'
import { MAIN_NET_ID } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    getAutoTournament
} from '../actions'


class AutoTournaments extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: false,
            tournament: {},
            matches: {},
            showRound: {}
        }
    }

    componentDidMount() {
		document.title = "Tournaments - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.getTournament()
        }, 500)
	}

    async getTournament() {
        const { chainId, gasPrice, gasLimit, networkUrl } = this.props

        this.props.getAutoTournament(chainId, gasPrice, gasLimit, networkUrl, "farmers", (response) => {
            let tId = parseInt(response['id']) - 1
            response['id'] = tId.toString()
            this.setState({ tournament: response })
            this.loadMatches(response)
        })
	}

    async loadMatches(info) {
        const docRef = doc(firebasedb, "auto_tournaments", info.id)

		const docSnap = await getDoc(docRef)
		let data = docSnap.data()

        //console.log(data);

        if (data) {
            this.setState({ matches: data, loading: false })
        }
        else {
            this.setState({ loading: false, error: true })
        }
    }

    renderRoundTitle(round) {
        const { mainTextColor } = this.props
        const { loading, matches, tournament, showRound } = this.state

        return (
            !loading && matches[`${tournament.id}_r${round}`] &&
            <div style={{ alignItems: 'center', marginBottom: 10 }}>
                <p style={{ fontSize: 20, color: mainTextColor, marginRight: 10 }} className="text-bold">
                    Round {round}
                </p>

                {
                    !showRound[`r${round}`] &&
                    <button
                        style={{ alignItems: 'center', justifyContent: 'center' }}
                        onClick={() => {
                            let sR = Object.assign({}, this.state.showRound)
                            sR[`r${round}`] = true
                            this.setState({ showRound: sR })
                        }}
                    >
                        <MdRemoveRedEye
                            color={mainTextColor}
                            size={24}
                        />
                    </button>
                }
            </div>
        )

        return <div />
    }

    renderRoundData(round) {
        const { mainTextColor, isDarkmode } = this.props
        const { loading, matches, tournament, showRound } = this.state

        if (!showRound[`r${round}`]) {
            return (
                <div style={{ height: 30 }} />
            )
        }

        return (
            <div style={{ width: '100%', flexWrap: 'wrap', marginBottom: 10 }}>
                {
                    !loading && matches[`${tournament.id}_r${round}`] && matches[`${tournament.id}_r${round}`].map((item, index) => {
                        //console.log(item);
                        return boxPairAutoTournament(item, index, [], mainTextColor, this.props.history, isDarkmode)
                    })
                }
            </div>
        )
    }

    renderBody(isMobile) {
        const { loading, tournament, matches, showRound, error } = this.state
        const { mainTextColor, isDarkmode } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        if (error) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflow: 'auto' }}>
                    <p style={{ fontSize: 24, color: mainTextColor, marginBottom: 25 }}>
                        Last completed tournament ID: {tournament.id}
                    </p>

                    <p style={{ fontSize: 20, color: mainTextColor, marginBottom: 25 }}>
                        Error loading tournament...
                    </p>
                </div>
            )
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflow: 'auto' }}>
                <p style={{ fontSize: 24, color: mainTextColor, marginBottom: 25 }}>
                    Last completed tournament ID: {tournament.id}
                </p>

                {
					loading ?
					<div style={{ width: boxW, justifyContent: 'center', alignItems: 'center', paddingBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexDirection: 'column', flexWrap: 'wrap', marginBottom: 50 }}>

                    {this.renderRoundTitle(1)}
                    {this.renderRoundData(1)}

                    {this.renderRoundTitle(2)}
                    {this.renderRoundData(2)}

                    {this.renderRoundTitle(3)}
                    {this.renderRoundData(3)}

                    {this.renderRoundTitle(4)}
                    {this.renderRoundData(4)}

                    <div style={{ alignItems: 'center', marginTop: 10, marginBottom: 10 }}>
                        <p style={{ fontSize: 24, color: mainTextColor, marginRight: 10 }} className="text-bold">
                            Winners
                        </p>

                        {
                            !showRound[`winners`] &&
                            <button
                                style={{ alignItems: 'center', justifyContent: 'center' }}
                                onClick={() => {
                                    let sR = Object.assign({}, this.state.showRound)
                                    sR[`winners`] = true
                                    this.setState({ showRound: sR })
                                }}
                            >
                                <MdRemoveRedEye
                                    color={mainTextColor}
                                    size={24}
                                />
                            </button>
                        }
                    </div>
                    <div style={{ width: '100%', flexWrap: 'wrap', alignItems: 'center' }}>
                        {
                            !loading && showRound['winners'] && matches[`winners`].map((item, index) => {
                                return (
                                    <a
                                        href={`${window.location.protocol}//${window.location.host}/nft/${item}`}
                                        onClick={(e) => {
                                            e.preventDefault()
                                            this.props.history.push(`/nft/${item}`)
                                        }}
                                        style={{ position: 'relative', marginRight: 10 }}
                                        key={item}
                                    >
                                        <img
                                            style={{ width: 110, height: 110, borderRadius: 4, borderWidth: 1, borderColor: 'white', borderStyle: 'solid', marginBottom: 4 }}
                                            src={getImageUrl(item)}
                                            alt={`#${item}`}
                                        />
                                    </a>
                                )
                            })
                        }
                    </div>
                </div>
            </div>
        )
    }

    renderTopHeader(isMobile) {
		const { account } = this.props

		return (
			<div>
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
}

const mapStateToProps = (state) => {
	const { account, chainId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor } = state.mainReducer;

	return { account, chainId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor };
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    getAutoTournament
})(AutoTournaments)
