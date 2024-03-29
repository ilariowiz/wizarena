import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { firebasedb } from './Firebase';
import { sample } from 'lodash'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import ModalChooseWizard from './common/ModalChooseWizard'
import getBoxWidth from './common/GetBoxW'
import { TEXT_SECONDARY_COLOR, CTA_COLOR, MAIN_NET_ID } from '../actions/types'
import {
    setNetworkUrl,
    setNetworkSettings,
    loadUserMintedNfts,
    setSfidaPvE
} from '../actions'

const orc_berserker = require('../assets/monsters/orc_1.png')
const orc_defensive = require('../assets/monsters/orc_defensive.png')
const orc_average = require('../assets/monsters/orc_average.png')

const orcs_images = [orc_berserker, orc_defensive, orc_average]

class PvE extends Component {
    constructor(props) {
        super(props)

        this.sampleImage = sample(orcs_images)

        this.state = {
            loading: true,
            error: "",
            chosenMonster: "",
            showModalChooseWizard: false
        }
    }

    componentDidMount() {
		document.title = "PvE - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
        }, 500)
	}

    loadMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        if (account && account.account && !userMintedNfts) {
            this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, () => {
                this.setState({ loading: false })
            })
        }
        else {
            this.setState({ loading: false })
        }
    }

    renderBtnStyleFight(key) {
        return (
            <button
                style={styles.btnFight}
                onClick={() => {
                    if (this.state.loading) {
                        return
                    }
                    this.setState({ showModalChooseWizard: true, chosenMonster: key })
                }}
            >
                <p style={{ fontSize: 15, color: 'white' }} className="text-bold">
                    {key}
                </p>
            </button>
        )
    }

    goToFight(wizardId) {
        const { chosenMonster } = this.state

        this.props.setSfidaPvE({
            chosenWizard: wizardId,
            chosenMonster
        })

        this.props.history.push("/fightpve")
    }

    renderBody(isMobile) {
        const { loading, error, showModalChooseWizard } = this.state
        const { mainTextColor, mainBackgroundColor, userMintedNfts } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        let widthRowBtns = isMobile ? boxW : boxW * 44/100
        if (widthRowBtns < 400) {
            widthRowBtns = boxW
        }

        return (
            <div style={{ flexDirection: 'column', textAlign: 'center', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24 }} className="text-medium">
                    PvE
                </p>

                {
					this.state.loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', marginBottom: 10, marginTop: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
                        <p style={{ fontSize: 15, color: mainTextColor, marginTop: 7 }}>
                            Loading your wizards...
                        </p>
					</div>
					: null
				}

                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                    <img
                        src={this.sampleImage}
                        style={{ width: 300, marginBottom: 50 }}
                    />

                    <div style={{  alignItems: 'center', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-around', width: widthRowBtns, marginBottom: 20 }}>
                        {this.renderBtnStyleFight("Berserker")}
                        {this.renderBtnStyleFight("Defensive")}
                        {this.renderBtnStyleFight("Average")}
                    </div>
                </div>

                <ModalChooseWizard
                    showModal={showModalChooseWizard}
                    onCloseModal={() => this.setState({ showModalChooseWizard: false })}
                    yourWizards={userMintedNfts}
                    onSelect={(id) => {
                        this.setState({ showModalChooseWizard: false })
                        this.goToFight(id)
                    }}
                />
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
    btnFight: {
        borderRadius: 4,
        width: 120,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        marginBottom: 15
    }
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor, userMintedNfts, account, chainId, gasPrice, gasLimit, networkUrl } = state.mainReducer

    return { userMintedNfts, mainTextColor, mainBackgroundColor, account, chainId, gasPrice, gasLimit, networkUrl }
}

export default connect(mapStateToProps, {
    setNetworkUrl,
    setNetworkSettings,
    loadUserMintedNfts,
    setSfidaPvE
})(PvE)
