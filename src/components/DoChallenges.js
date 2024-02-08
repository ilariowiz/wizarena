import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import getBoxWidth from './common/GetBoxW'
import { getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import cardStats from './common/CardStats'
import getRingBonuses from './common/GetRingBonuses'
import getImageUrl from './common/GetImageUrl'
import NftCardChoice from './common/NftCardChoice'
import { TEXT_SECONDARY_COLOR, MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    loadUserMintedNfts,
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    sendChallenge,
    updateInfoTransactionModal,
    getInfoAuraMass
} from '../actions'
import '../css/Nft.css'



class DoChallenges extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: false,
            error: "",
            yourNfts: [],
            equipment: [],
            auras: [],
            yourChampion: {},
            showYourNfts: false,
            inputPrice: '',
            coin: "wiza"
        }
    }

    componentDidMount() {
		document.title = "Start Challenge - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadMinted()
            this.loadEquip()
        }, 500)
	}

    loadMinted() {
		const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

		this.setState({ loading: true })

		if (account && account.account) {
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, async (response) => {
				//console.log(response);
                const yourNfts = response.filter(i => !i.listed)
                //console.log(yourNfts);

                let idnfts = yourNfts.map(i => i.id)
                const auras = await this.props.getInfoAuraMass(chainId, gasPrice, gasLimit, networkUrl, idnfts)

				this.setState({ loading: false, yourNfts, auras })
			})
		}
	}

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {
			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);
                this.setState({ equipment: response })
			})
		}
    }

    onlyNumbers(str) {
		return /^[0-9]+$/.test(str);
	}

    sendChallenge() {
        const { yourChampion, inputPrice, coin } = this.state
        const { wizardSfidato, chainId, gasPrice, netId, account } = this.props


        if (!this.onlyNumbers(inputPrice) || !inputPrice || parseInt(inputPrice) < 0) {
			//console.log('price bad format')
			toast.error('Please enter a valid amount')
			return
		}


        if (!yourChampion.id) {
            toast.error('Please select your wizard')
			return
        }

        if (!wizardSfidato.id) {
            toast.error('No opponent wizard')
			return
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `Your #${yourChampion.id} will challenge #${wizardSfidato.id} for ${inputPrice} $${coin.toUpperCase()}`,
			typeModal: 'sendchallenge',
			transactionOkText: `Challenge sent!`,
            makeOfferValues: { wiz1id: yourChampion.id, wiz2id: wizardSfidato.id, amount: inputPrice, coin }
		})

        this.props.sendChallenge(chainId, gasPrice, netId, yourChampion.id, wizardSfidato.id, account, inputPrice, coin)
    }

    renderSelectYourChampion(width, isMobile) {

        const widthImg = isMobile ? width-10 : width

        return (
            <button
                className="btnH"
                style={{ width: isMobile ? width : width*2, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', alignItems: 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
                onClick={() => {
                    this.setState({ showYourNfts: true }, () => {
                        document.getElementById("box-yournfts").scrollIntoView({ behavior: 'smooth' })
                    })
                }}
            >
                <img
                    style={{ width: widthImg, height: widthImg }}
                    src={getImageUrl(undefined)}
                    alt="placeholder"
                />

                <p style={{ fontSize: 17, color: this.props.mainTextColor, marginLeft: isMobile ? 0 : 10, marginRight: isMobile ? 0 : 10, marginTop: isMobile ? 20 : 0, marginBottom: isMobile ? 20 : 0 }} className="text-medium">
                    Choose your wizard
                </p>
            </button>
        )
    }


    renderSingleNft(info, width, isMobile) {
        const { mainTextColor, isDarkmode } = this.props
        //console.log(info);

        let infoEquipment;
        if (info.ring && info.ring.bonus) {
            infoEquipment = getRingBonuses(info.ring)
        }
        //console.log(infoEquipment);

        if (info.aura && info.aura.bonus.int > 0) {
            if (infoEquipment) {
                infoEquipment.bonusesText.push(`+${info.aura.bonus.int} Aura defense`)
                if (infoEquipment.bonusesDict['defense']) {
                    infoEquipment.bonusesDict['defense'] += info.aura.bonus.int
                }
                else {
                    infoEquipment.bonusesDict['defense'] = info.aura.bonus.int
                }
            }
            else {
                infoEquipment.bonusesText = [`+${info.aura.bonus.int} Aura defense`]
                infoEquipment.bonusesDict = {}
                infoEquipment['defense'] = info.aura.bonus.int
            }
        }

        const widthImg = isMobile ? width : width-10

        return (
            <div style={Object.assign({}, styles.containerCard, { flexDirection: isMobile ? 'column' : 'row', width: isMobile ? width : width*2 })}>
                <img
                    style={{ width: widthImg, height: widthImg, marginLeft: isMobile ? 0 : 10, borderRadius: 4 }}
                    src={getImageUrl(info.id, "1")}
                    alt={`#${info.id}`}
                />

                <div style={{ flexDirection: 'column', width: width - 20, marginLeft: 10, marginRight: 10 }}>
                    <div style={{ marginBottom: 5, marginTop: 10 }}>
                        {
                            info.nickname ?
                            <p style={{ color: mainTextColor, fontSize: 16 }} className="text-medium">
                                {info.name} {info.nickname}
                            </p>
                            :
                            <p style={{ color: mainTextColor, fontSize: 16 }} className="text-medium">
                                {info.name}
                            </p>
                        }
                    </div>

                    <div style={{ marginBottom: 5, alignItems: 'center' }}>
                        <p style={{ color: mainTextColor, fontSize: 15, marginRight: 8 }}>
                            Level
                        </p>

                        <p style={{ color: getColorTextBasedOnLevel(info.level, isDarkmode), fontSize: 17 }} className="text-bold">
                            {info.level}
                        </p>
                    </div>

                    {cardStats(info, undefined, '100%', infoEquipment ? infoEquipment.bonusesDict : undefined, mainTextColor)}

                    {/*
                        info.ring && info.ring.bonus ?
                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <img
                                src={info.ring.url}
                                style={{ width: 50, height: 50, borderRadius: 4, borderColor: '#d7d7d7', borderWidth: 1, borderStyle: 'solid', marginRight: 10 }}
                                alt="Ring"
                            />
                            <p style={{ fontSize: 14, color: mainTextColor }}>
                                {info.ring.name}
                            </p>
                        </div>
                        :
                        null
                    */}
                </div>
            </div>
        )
    }

    renderNewChallenge(isMobile, spaceImage) {
        const { wizardSfidato, mainTextColor } = this.props
        const { yourChampion } = this.state

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', flexWrap: 'wrap', flex: 1 }} id='box-top'>
                {
                    yourChampion && yourChampion.id ?
                    this.renderSingleNft(yourChampion, spaceImage, isMobile)
                    :
                    this.renderSelectYourChampion(spaceImage, isMobile)
                }

                <p style={{ marginTop: 15, marginBottom: 15, fontSize: 20, color: mainTextColor, width: isMobile ? spaceImage : spaceImage*2, textAlign: 'center' }}>
                    VS
                </p>

                {this.renderSingleNft(wizardSfidato, spaceImage, isMobile)}
            </div>
        )
    }

    renderRightChallenge() {
        const { inputPrice, coin } = this.state
        const { mainTextColor } = this.props

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>

                <div style={{ alignItems: 'center', justifyContent: 'space-between', width: '100%', marginBottom: 30, maxWidth: 160 }}>
                    <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }}>
                            $WIZA
                        </p>

                        <input
                            type='radio'
                            value="wiza"
                            checked={coin === "wiza"}
                            onChange={(e) => this.setState({ coin: "wiza" })}
                        />
                    </div>

                    <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                        <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center' }}>
                            $KDA
                        </p>

                        <input
                            type='radio'
                            value="kda"
                            checked={coin === "kda"}
                            onChange={(e) => this.setState({ coin: "kda" })}
                        />
                    </div>
                </div>

                <p style={{ fontSize: 17, color: mainTextColor, marginBottom: 5 }} className="text-medium">
                    ${coin.toUpperCase()} amount
                </p>

                <input
                    style={styles.inputPriceStyle}
                    placeholder={coin.toUpperCase()}
                    value={inputPrice}
                    onChange={(e) => this.setState({ inputPrice: e.target.value })}
                />

                <p style={{ fontSize: 16, color: mainTextColor, margin: 15, textAlign: 'center' }}>
                    Your opponent will have 3 days to accept the challenge. If he doesn't accept it, you can collect the ${coin.toUpperCase()} in the Challenges tab
                </p>

                <button
                    className="btnH"
                    style={styles.btnChallenge}
                    onClick={() => this.sendChallenge()}
                >
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Challenge
                    </p>
                </button>
            </div>
        )
    }

    renderRowChoise(item, index, modalWidth) {
        const { equipment, auras } = this.state

        //console.log(item);

		return (
			<NftCardChoice
				key={index}
				item={item}
				width={230}
				onSubscribe={(spellSelected) => {
                    item['spellSelected'] = spellSelected
                    const ring = equipment.find(i => i.equippedToId === item.id && i.equipped)
                    item['ring'] = ring

                    const pendant = equipment.find(i => i.equippedToId === `${item.id}pendant` && i.equipped)
                    item['pendant'] = pendant

                    const aura = auras.find(i => i.idnft === item.id)
                    if (aura && aura.bonus.int > 0) {
                        item['aura'] = aura
                    }

                    this.setState({ yourChampion: item }, () => {
                        document.getElementById("box-top").scrollIntoView({ behavior: 'smooth' })
                    })
                }}
				modalWidth={modalWidth}
                section={"challenge"}
			/>
		)
	}

    renderBody(isMobile) {
        const { loading, error, yourNfts, showYourNfts } = this.state
        const { wizardSfidato, mainTextColor } = this.props

        const { boxW, modalW, padding } = getBoxWidth(isMobile)

        let spaceImage = isMobile ? (boxW * 95 / 100) : (boxW / 2) - 100
        if (spaceImage > 220 && !isMobile) {
            spaceImage = 220
        }

        if (!wizardSfidato) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden' }}>

                    <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                        Start Challenge
                    </p>

                    <p style={{ color: mainTextColor, fontSize: 18 }}>
                        Choose a wizard to start a challenge
                    </p>

                    <button
                        style={styles.btnBack}
                        className="btnH"
                        onClick={() => this.props.history.replace("/challenges")}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Check your active challenges
                        </p>
                    </button>

                </div>
            )
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                    Start Challenge
                </p>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 10, marginBottom: 30 }}>
						<DotLoader size={25} color={TEXT_SECONDARY_COLOR} />
					</div>
					: null
				}

                {
                    error &&
                    <p style={{ fontSize: 15, color: 'red' }}>
                        {error}
                    </p>
                }

                <div style={{ flexDirection: isMobile ? 'column' : 'row' }}>
                    {this.renderNewChallenge(isMobile, spaceImage)}

                    <div style={{ flex: 1, justifyContent: 'center', alignItems: 'center', marginTop: isMobile ? 30 : 0 }}>
                        {this.renderRightChallenge()}
                    </div>

                </div>

                {
                    showYourNfts ?
                    <p style={{ fontSize: 18, color: mainTextColor, marginTop: 40 }} className="text-medium" id="box-yournfts">
                        Choose your wizard
                    </p>
                    : null
                }

                <div style={{ flexWrap: 'wrap', marginTop: 10 }}>
                {
                    showYourNfts ?
                    yourNfts.map((item, index) => {
                        return this.renderRowChoise(item, index, modalW)
                    })
                    : null
                }
                </div>

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

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

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
    containerCard: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderRadius: 4,
        borderStyle: 'solid',
    },
    inputPriceStyle: {
		width: 100,
		height: 40,
		color: 'black',
		borderRadius: 4,
		borderColor: '#d7d7d7',
		borderStyle: 'solid',
		borderWidth: 1,
		fontSize: 16,
        fontFamily: 'FigtreeMedium',
		paddingLeft: 10,
		WebkitAppearance: 'none',
		MozAppearance: 'none',
		appearance: 'none',
		outline: 'none',
        marginBottom: 30
	},
    btnChallenge: {
        width: 150,
        height: 40,
        backgroundColor: CTA_COLOR,
        borderRadius: 4,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    btnBack: {
        marginTop: 40,
        width: 220,
        height: 40,
        paddingTop: 5,
        paddingBottom: 5,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        borderRadius: 4
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer
    const { wizardSfidato } = state.challengesReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizardSfidato, mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    sendChallenge,
    updateInfoTransactionModal,
    getInfoAuraMass
})(DoChallenges)
