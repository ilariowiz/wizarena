import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import { AiOutlinePlus } from 'react-icons/ai'
import ModalForgeEquipment from './common/ModalForgeEquipment'
import ModalRecipeBook from './common/ModalRecipeBook'
import getBoxWidth from './common/GetBoxW'
import recipeBook from './common/RecipeBook'
import forgeLevel from './common/ForgeLevel'
import { BACKGROUND_COLOR, TEXT_SECONDARY_COLOR, MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    clearTransaction,
    getForgeLevel,
    getDiscountLevel,
    forgeItem,
    updateInfoTransactionModal
} from '../actions'

const ring_placeholder = require('../assets/ring_placeholder.png')
const recipe_book = require('../assets/book.png')

class Forge extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            error: "",
            ring1: {},
            ring2: {},
            showModalYourRings: false,
            ringIdxSelected: 1,
            yourEquip: [],
            selectionRing2: [],
            finalRecipe: undefined,
            showModalRecipe: false,
            discount: 1,
            forgeXP: 0,
            level: 1,
            xpNextLevel: 2000
        }
    }

    componentDidMount() {
		document.title = "Forge - Wizards Arena"

        this.props.setNetworkSettings(MAIN_NET_ID, "1")
		this.props.setNetworkUrl(MAIN_NET_ID, "1")

        setTimeout(() => {
            this.loadEquip()
            this.loadForgeLevel()
            this.loadForgeDiscount()
        }, 500)
	}

    loadEquip() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.loadEquipMinted(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                let final = []

                final = response.filter(i => !i.equipped)

                final = final.sort((a, b) => {
                    return parseInt(b.id) - parseInt(a.id)
                })

                this.setState({ loading: false, yourEquip: final })
			})
		}
    }

    loadForgeLevel() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.getForgeLevel(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                if (response) {
                    const level = forgeLevel(response)
                    //console.log(level);
                    this.setState({ forgeXP: response, level: level.level, xpNextLevel: level.xpNextLevel })
                }
			})
		}
    }

    loadForgeDiscount() {
        const { account, chainId, gasPrice, gasLimit, networkUrl } = this.props

        if (account && account.account) {

			this.props.getDiscountLevel(chainId, gasPrice, gasLimit, networkUrl, account, (response) => {
                //console.log(response);

                if (response) {
                    this.setState({ discount: response })
                }
			})
		}
    }

    selectRing1(item) {
        const { yourEquip } = this.state

        let selectionRing2 = []

        for (let i = 0; i < yourEquip.length; i++) {
            const e = yourEquip[i]

            if (e.id !== item.id) {
                recipeBook.map(r => {

                    if (r.ingredients.includes(item.bonus) && r.ingredients.includes(e.bonus)) {
                        selectionRing2.push(e)
                    }
                })
            }
        }

        //console.log(selectionRing2);
        this.setState({ ring1: item, ring2: {}, selectionRing2, finalRecipe: undefined, showModalYourRings: false })
    }

    selectRing2(item) {
        const { ring1 } = this.state

        let finalRecipe = recipeBook.find(i => i.ingredients === `${ring1.bonus}_${item.bonus}`)

        this.setState({ ring2: item, finalRecipe, showModalYourRings: false })
    }

    forge() {
        const { ring1, ring2, finalRecipe } = this.state
        const { account, chainId, gasPrice, netId } = this.props

        if (!ring1 || !ring2 || !finalRecipe) {
            return
        }

        //console.log(ring1, finalRecipe);
        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to forge a ring.',
            typeModal: 'forge',
            transactionOkText: 'Ring forged successfully'
        })

        this.props.forgeItem(chainId, gasPrice, netId, finalRecipe.ingredients, [ring1.id, ring2.id], account)
    }

    renderProgressLevel() {
        const { level, forgeXP, xpNextLevel } = this.state
        const { mainTextColor } = this.props

        const pct = forgeXP * 100 / xpNextLevel

        return (
            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 5 }} className="text-medium">
                    Level {level}
                </p>

                <div style={styles.barLevelContainer}>
                    <div style={{ backgroundColor: '#a22634', width: `${pct}%`, height: 16, borderRadius: 4 }} />

                    <p style={{ fontSize: 13, color: mainTextColor, position: 'absolute', left: 7 }}>
                        {forgeXP}
                    </p>

                    <p style={{ fontSize: 13, color: mainTextColor, position: 'absolute', right: 7 }}>
                        {xpNextLevel}
                    </p>
                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { loading, error, ring1, ring2, ringIdxSelected, finalRecipe, discount } = this.state
        const { mainTextColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        let imageW = 100

        let wizaFee = 0
        if (finalRecipe) {
            wizaFee = (finalRecipe.wiza - (finalRecipe.wiza * discount / 100))
        }

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, overflowY: 'auto', overflowX: 'hidden' }}>

                <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20 }} className="text-medium">
                    Forge
                </p>

                <div style={{ width: boxW, alignItems: 'center', justifyContent: 'center', position: 'relative', flexDirection: 'column', marginBottom: 20 }}>

                    {this.renderProgressLevel()}

                    <div style={{ justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                        <div style={{ width: 60, minWidth: 60, height: 10 }} />

                        <p style={{ fontSize: isMobile ? 15 : 17, color: mainTextColor, textAlign: 'center', marginLeft: 15, marginRight: 15 }}>
                            Select a ring and find out what you can combine it with
                        </p>

                        <button
                            style={styles.recipeBookBtn}
                            onClick={() => this.setState({ showModalRecipe: true })}
                        >
                            <img
                                src={recipe_book}
                                style={{ width: 60 }}
                                alt="Recipe Book"
                            />
                            <p style={{ fontSize: 13, color: mainTextColor, textAlign: 'center' }}>
                                Recipe Book
                            </p>
                        </button>

                    </div>


                </div>

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                <div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                    <div style={{ width: '100%', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>

                        <button
                            className='btnH'
                            style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}
                            onClick={() => this.setState({ showModalYourRings: true, ringIdxSelected: 1 })}
                        >
                            {
                                ring1 && Object.keys(ring1).length > 0 ?
                                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 10 }}>
                                    <img
                                        src={ring1.url}
                                        style={{ width: imageW, height: imageW }}
                                        alt="Ring 1"
                                    />
                                    <p style={{ fontSize: 15, color: mainTextColor, marginTop: 5, textAlign: 'center' }}>
                                        #{ring1.id} {ring1.name}
                                    </p>
                                </div>
                                :
                                <img
                                    src={ring_placeholder}
                                    style={{ width: imageW, height: imageW }}
                                    alt="Placeholder"
                                />
                            }
                        </button>

                        <div style={{ width: 30, height: 30 }} />

                        <AiOutlinePlus
                            color={mainTextColor}
                            size={26}
                        />

                        <div style={{ width: 30, height: 30 }} />

                        <button
                            className='btnH'
                            style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}
                            onClick={() => this.setState({ showModalYourRings: true, ringIdxSelected: 2 })}
                        >
                            {
                                ring2 && Object.keys(ring2).length > 0 ?
                                <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 10 }}>
                                    <img
                                        src={ring2.url}
                                        style={{ width: imageW, height: imageW }}
                                        alt="Ring 2"
                                    />
                                    <p style={{ fontSize: 15, color: mainTextColor, marginTop: 5, textAlign: 'center' }}>
                                        #{ring2.id} {ring2.name}
                                    </p>
                                </div>
                                :
                                <img
                                    src={ring_placeholder}
                                    style={{ width: imageW, height: imageW }}
                                    alt="Placeholder"
                                />
                            }
                        </button>

                        <div style={{ width: 30, height: 30 }} />

                        <AiOutlinePlus
                            color={mainTextColor}
                            size={26}
                        />

                        <div style={{ width: 30, height: 30 }} />

                        <div style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}>
                            <p style={{ fontSize: 19, color: mainTextColor }} className="text-bold">
                                {finalRecipe ? wizaFee : '...'} $WIZA
                            </p>
                        </div>

                    </div>

                    <p style={{ fontSize: 40, color: mainTextColor, marginBottom: 10 }}>
                    =
                    </p>

                    <div style={styles.boxImage}>
                        {
                            finalRecipe ?
                            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 10 }}>
                                <img
                                    src={finalRecipe.url}
                                    style={{ width: imageW, height: imageW }}
                                    alt="Forged Ring"
                                />
                                <p style={{ fontSize: 15, color: mainTextColor, marginTop: 5, textAlign: 'center' }}>
                                    {finalRecipe.name}
                                </p>
                            </div>
                            :
                            <img
                                src={ring_placeholder}
                                style={{ width: imageW, height: imageW }}
                                alt="Placeholder"
                            />
                        }
                    </div>

                    <button
                        className='btnH'
                        style={styles.btnForge}
                        onClick={() => {
                            this.forge()
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            FORGE
                        </p>
                    </button>

                </div>

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }

                <ModalForgeEquipment
                    showModal={this.state.showModalYourRings}
                    onCloseModal={() => {
                         this.setState({ showModalYourRings: false })
                    }}
                    rings={ringIdxSelected === 1 ? this.state.yourEquip : this.state.selectionRing2}
                    onSelectRing={(item) => {
                        if (this.state.ringIdxSelected === 1) {
                            this.selectRing1(item)
                        }
                        else {
                            if (Object.keys(this.state.ring1).length === 0) {
                                this.selectRing1(item)
                            }
                            else {
                                this.selectRing2(item)
                            }
                        }
                    }}
                />

                <ModalRecipeBook
                    showModal={this.state.showModalRecipe}
                    onCloseModal={() => {
                         this.setState({ showModalRecipe: false })
                    }}
                    isMobile={isMobile}
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
					section={19}
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
		backgroundColor: "white"
	},
    boxImage: {
        width: 180,
        height: 180,
        borderRadius: 4,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
        display: 'flex'
    },
    btnForge: {
        height: 40,
        width: 184,
        marginTop: 35,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR,
        marginBottom: 30
    },
    recipeBookBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
    },
    barLevelContainer: {
        width: 300,
        height: 16,
        borderRadius: 4,
        overflow: 'hidden',
        position: 'relative',
        borderWidth: 1,
        borderColor: '#d7d7d7',
        borderStyle: 'solid',
        alignItems: 'center'
    }
}

const mapStateToProps = (state) => {
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, mainTextColor } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, mainTextColor }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    clearTransaction,
    getForgeLevel,
    getDiscountLevel,
    forgeItem,
    updateInfoTransactionModal
})(Forge)
