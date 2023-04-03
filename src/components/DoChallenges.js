import React, { Component } from 'react'
import { connect } from 'react-redux'
import { getDocs, collection, query, where, orderBy } from "firebase/firestore";
import { firebasedb } from './Firebase';
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import toast, { Toaster } from 'react-hot-toast';
import moment from 'moment'
import getBoxWidth from './common/GetBoxW'
import { calcLevelWizard, getColorTextBasedOnLevel } from './common/CalcLevelWizard'
import cardStats from './common/CardStats'
import getRingBonuses from './common/GetRingBonuses'
import getImageUrl from './common/GetImageUrl'
import NftCardChoiceDuel from './common/NftCardChoiceDuel'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    loadUserMintedNfts,
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    sendChallenge,
    updateInfoTransactionModal
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
            yourChampion: {},
            showYourNfts: false,
            inputPrice: '',
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
			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account, (response) => {
				//console.log(response);
                const yourNfts = response.filter(i => !i.listed)
                //console.log(yourNfts);

				this.setState({ loading: false, yourNfts })
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
        const { yourChampion, inputPrice } = this.state
        const { wizardSfidato, chainId, gasPrice, netId, account } = this.props

        /*
        if (!this.onlyNumbers(inputPrice) || !inputPrice || parseInt(inputPrice) < 0) {
			//console.log('price bad format')
			toast.error('Please enter a valid amount')
			return
		}
        */

        if (!yourChampion.id) {
            toast.error('Please select your wizard')
			return
        }

        if (!wizardSfidato.id) {
            toast.error('No opponent wizard')
			return
        }

        this.props.updateInfoTransactionModal({
			transactionToConfirmText: `Your #${yourChampion.id} will challenge #${wizardSfidato.id}`,
			typeModal: 'sendchallenge',
			transactionOkText: `Challenge sent!`,
            makeOfferValues: { wiz1id: yourChampion.id, wiz2id: wizardSfidato.id, amount: 0 }
		})

        this.props.sendChallenge(chainId, gasPrice, netId, yourChampion.id, wizardSfidato.id, account, 0)
    }

    renderSelectYourChampion(width, isMobile) {

        const widthImg = isMobile ? width-10 : width

        return (
            <button
                className="btnH"
                style={{ width: isMobile ? width : width*2, borderRadius: 2, borderColor: 'white', borderWidth: 1, borderStyle: 'solid', alignItems: 'center', display: 'flex', flexDirection: isMobile ? 'column' : 'row' }}
                onClick={() => {
                    this.setState({ showYourNfts: true }, () => {
                        document.getElementById("box-yournfts").scrollIntoView({ behavior: 'smooth' })
                    })
                }}
            >
                <img
                    style={{ width: widthImg, height: widthImg }}
                    src={getImageUrl(undefined)}
                />

                <p style={{ fontSize: 16, color: 'white', marginLeft: isMobile ? 0 : 10, marginRight: isMobile ? 0 : 10, marginTop: isMobile ? 20 : 0, marginBottom: isMobile ? 20 : 0 }}>
                    Choose your wizard
                </p>
            </button>
        )
    }


    renderSingleNft(info, width, isMobile) {

        //console.log(info);

        const level = calcLevelWizard(info)

        let infoEquipment;
        if (info.equipment && info.equipment.bonus) {
            infoEquipment = getRingBonuses(info.equipment)
        }
        //console.log(infoEquipment);

        const widthImg = isMobile ? width : width-10

        return (
            <div style={Object.assign({}, styles.containerCard, { flexDirection: isMobile ? 'column' : 'row', width: isMobile ? width : width*2 })}>
                <img
                    style={{ width: widthImg, height: widthImg, marginLeft: isMobile ? 0 : 10, borderRadius: 2 }}
                    src={getImageUrl(info.id, "1")}
                    alt={`#${info.id}`}
                />

                <div style={{ flexDirection: 'column', width: width - 20, marginLeft: 10, marginRight: 10 }}>
                    <div style={{ marginBottom: 5, marginTop: 10 }}>
                        {
                            info.nickname ?
                            <p style={{ color: 'white', fontSize: 18 }}>
                                {info.name} {info.nickname}
                            </p>
                            :
                            <p style={{ color: 'white', fontSize: 19 }}>
                                {info.name}
                            </p>
                        }
                    </div>

                    <div style={{ marginBottom: 5, alignItems: 'center' }}>
                        <p style={{ color: '#c2c0c0', fontSize: 16, marginRight: 8 }}>
                            LEVEL
                        </p>

                        <p style={{ color: getColorTextBasedOnLevel(level), fontSize: 20 }}>
                            {level}
                        </p>
                    </div>

                    {cardStats(info, undefined, '100%', infoEquipment ? infoEquipment.bonusesDict : undefined)}

                    {
                        info.equipment && info.equipment.bonus ?
                        <div style={{ alignItems: 'center', marginBottom: 10 }}>
                            <img
                                src={info.equipment.url}
                                style={{ width: 50, height: 50, borderRadius: 2, borderColor: 'white', borderWidth: 1, borderStyle: 'solid', marginRight: 10 }}
                            />
                            <p style={{ fontSize: 16, color: 'white' }}>
                                {info.equipment.name}
                            </p>
                        </div>
                        :
                        null
                    }
                </div>
            </div>
        )
    }

    renderNewChallenge(isMobile, spaceImage) {
        const { wizardSfidato } = this.props
        const { yourChampion } = this.state

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', flexWrap: 'wrap', flex: 1 }} id='box-top'>
                {
                    yourChampion && yourChampion.id ?
                    this.renderSingleNft(yourChampion, spaceImage, isMobile)
                    :
                    this.renderSelectYourChampion(spaceImage, isMobile)
                }

                <p style={{ marginTop: 15, marginBottom: 15, fontSize: 26, color: 'white', width: isMobile ? spaceImage : spaceImage*2, textAlign: 'center' }}>
                    VS
                </p>

                {this.renderSingleNft(wizardSfidato, spaceImage, isMobile)}
            </div>
        )
    }

    renderRightChallenge() {
        const { inputPrice } = this.state

        return (
            <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                <p style={{ fontSize: 17, color: 'white', marginBottom: 5 }}>
                    KDA amount
                </p>

                {/*<input
                    style={styles.inputPriceStyle}
                    placeholder='KDA'
                    value={inputPrice}
                    onChange={(e) => this.setState({ inputPrice: e.target.value })}
                />*/}

                <p style={{ fontSize: 16, color: 'white', marginBottom: 40 }}>
                    Testing phase, no KDA will be sent
                </p>

                <p style={{ fontSize: 17, color: 'white', margin: 15, textAlign: 'center' }}>
                    Your opponent will have 3 days to accept the challenge. If he doesn't accept it, you can collect the KDAs in the Challenges tab
                </p>

                <button
                    className="btnH"
                    style={styles.btnChallenge}
                    onClick={() => this.sendChallenge()}
                >
                    <p style={{ fontSize: 16, color: 'white' }}>
                        CHALLENGE
                    </p>
                </button>
            </div>
        )
    }

    renderRowChoise(item, index, modalWidth) {
        const { yourChampion, equipment } = this.state

        //console.log(item);

		return (
			<NftCardChoiceDuel
				key={index}
				item={item}
				width={230}
                equipment={equipment}
                subscriptionsInfo={yourChampion}
				onSubscribe={(spellSelected) => {
                    item['spellSelected'] = spellSelected
                    const ring = equipment.find(i => i.equippedToId === item.id && i.equipped)
                    item['equipment'] = ring

                    this.setState({ yourChampion: item }, () => {
                        document.getElementById("box-top").scrollIntoView({ behavior: 'smooth' })
                    })
                }}
				modalWidth={modalWidth}
			/>
		)
	}

    renderBody(isMobile) {
        const { loading, error, yourNfts, showYourNfts } = this.state
        const { wizardSfidato } = this.props

        const { boxW, modalW } = getBoxWidth(isMobile)

        let spaceImage = isMobile ? (boxW * 95 / 100) : (boxW / 2) - 100
        if (spaceImage > 220 && !isMobile) {
            spaceImage = 220
        }

        if (!wizardSfidato) {
            return (
                <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

                    <p style={{ color: 'white', fontSize: 30, marginBottom: 20 }}>
                        Start Challenge
                    </p>

                    <p style={{ color: 'white', fontSize: 20 }}>
                        Choose a wizard to start a challegne
                    </p>

                </div>
            )
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, marginTop: 5, padding: !isMobile ? 25 : 15, overflow: 'auto' }}>

                <p style={{ color: 'white', fontSize: 30, marginBottom: 20 }}>
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
                    <p style={{ fontSize: 17, color: 'white' }}>
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
                    <p style={{ fontSize: 22, color: 'white', marginTop: 40 }} id="box-yournfts">
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
					section={24}
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

                <Toaster
                    position="top-center"
                    reverseOrder={false}
                />

				<Media
					query="(max-width: 1199px)"
					render={() => this.renderTopHeader(true)}
				/>

				<Media
					query="(min-width: 1200px)"
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
		flexDirection: 'row',
		position: 'absolute',
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		backgroundColor: BACKGROUND_COLOR
	},
    containerCard: {
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'white',
        borderRadius: 2,
        borderStyle: 'solid',
    },
    inputPriceStyle: {
		width: 100,
		height: 40,
		color: 'black',
		borderRadius: 2,
		borderColor: '#b9b7b7',
		borderStyle: 'solid',
		borderWidth: 2,
		fontSize: 18,
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
        borderRadius: 2,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId } = state.mainReducer
    const { wizardSfidato } = state.challengesReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, wizardSfidato }
}

export default connect(mapStateToProps, {
    loadUserMintedNfts,
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    sendChallenge,
    updateInfoTransactionModal
})(DoChallenges)
