import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import DotLoader from 'react-spinners/DotLoader';
import { AiOutlinePlus } from 'react-icons/ai'
import ModalForgeEquipment from './common/ModalForgeEquipment'
import ModalChooseWizard from './common/ModalChooseWizard'
import getBoxWidth from './common/GetBoxW'
import recipeBook from './common/RecipeBook'
import forgeLevel from './common/ForgeLevel'
import getImageUrl from './common/GetImageUrl'
import { MAIN_NET_ID, CTA_COLOR } from '../actions/types'
import {
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    clearTransaction,
    getForgeLevel,
    getDiscountLevel,
    forgeItem,
    updateInfoTransactionModal,
    loadUserMintedNfts,
    forgeAp
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
            modalForgeTitle: "Your items",
            ringIdxSelected: 1,
            yourEquip: [],
            selectionRing2: [],
            finalRecipe: undefined,
            discount: 1,
            forgeXP: 0,
            level: 1,
            xpNextLevel: 2000,
            forgeSection: 1,
            wizardSelected: "",
            itemWanted: {},
            itemsInModal: [],
            showChooseWizard: false
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
            this.checkUserMinted()
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
                    const level = forgeLevel(response.int)
                    //console.log(level);
                    this.setState({ forgeXP: response.int, level: level.level, xpNextLevel: level.xpNextLevel })
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

    checkUserMinted() {
        const { account, chainId, gasPrice, gasLimit, networkUrl, userMintedNfts } = this.props

        if (!userMintedNfts) {
            if (account && account.account) {
    			this.props.loadUserMintedNfts(chainId, gasPrice, gasLimit, networkUrl, account.account)
    		}
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

                        const alreadyIncludes = selectionRing2.find(i => i.id === e.id)
                        if (!alreadyIncludes) {
                            selectionRing2.push(e)
                        }
                    }
                })
            }
        }

        //console.log(selectionRing2);
        this.setState({ ring1: item, ring2: {}, selectionRing2, finalRecipe: undefined, showModalYourRings: false })
    }

    selectRing2(item) {
        const { ring1 } = this.state

        let finalRecipe = recipeBook.find(i => {
            if (i.ingredients === `${ring1.bonus}_${item.bonus}` || i.ingredients === `${item.bonus}_${ring1.bonus}`) {
                return i
            }
        })

        this.setState({ ring2: item, finalRecipe, showModalYourRings: false })
    }

    selectItemsToForgeFromAp() {
        let options = recipeBook.filter(i => i.ingredients.includes("ap_to_"))
        return options
    }

    forge(costo) {
        const { ring1, ring2, finalRecipe } = this.state
        const { account, chainId, gasPrice, netId } = this.props

        if (!ring1 || !ring2 || !finalRecipe) {
            return
        }

        //console.log(ring1, finalRecipe);
        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to forge a a new powerful item.',
            typeModal: 'forge',
            transactionOkText: 'Item forged successfully'
        })

        this.props.forgeItem(chainId, gasPrice, netId, finalRecipe.ingredients, [ring1.id, ring2.id], account, costo)
    }

    forgeWithAp() {
        const { itemWanted, wizardSelected } = this.state
        const { account, chainId, gasPrice, netId } = this.props

        if (!itemWanted || !wizardSelected) {
            return
        }

        //console.log(itemWanted, wizardSelected);

        this.props.updateInfoTransactionModal({
            transactionToConfirmText: 'You are about to forge a a new powerful item.',
            typeModal: 'forge',
            transactionOkText: 'Item forged successfully'
        })

        this.props.forgeAp(chainId, gasPrice, netId, wizardSelected, account, itemWanted.ingredients)
    }

    renderProgressLevel() {
        const { level, forgeXP, xpNextLevel } = this.state
        const { mainTextColor } = this.props

        const pct = forgeXP * 100 / xpNextLevel

        return (
            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', marginBottom: 25 }}>
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

    renderMenu() {
        const { forgeSection } = this.state
        const { mainTextColor, mainBackgroundColor } = this.props

        return (
            <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ alignItems: 'center', justifyContent: 'center', borderColor: '#d7d7d7', borderStyle: 'solid', borderRadius: 4, borderWidth: 1, padding: 6, marginBottom: 40 }}>

                    <button
                        style={{ justifyContent: 'center', alignItems: 'center', width: 120, height: 32, borderRadius: 4, backgroundColor: forgeSection === 1 ? mainTextColor : 'transparent', cursor: 'pointer' }}
                        onClick={() => this.setState({ forgeSection: 1 })}
                    >
                        <p style={{ fontSize: 15, color: forgeSection === 1 ? mainBackgroundColor : mainTextColor }} className="text-medium">
                            Melt items
                        </p>
                    </button>

                    <button
                        style={{ justifyContent: 'center', alignItems: 'center', width: 120, height: 32, borderRadius: 4, backgroundColor: forgeSection === 2 ? mainTextColor : 'transparent', marginLeft: 15, cursor: 'pointer' }}
                        onClick={() => this.setState({ forgeSection: 2 })}
                    >
                        <p style={{ fontSize: 15, color: forgeSection === 2 ? mainBackgroundColor : mainTextColor }} className="text-medium">
                            Use AP
                        </p>
                    </button>
                </div>
            </div>
        )
    }

    renderClassicForge(isMobile) {
        const { ring1, ring2, finalRecipe, discount, level } = this.state
        const { mainTextColor } = this.props

        let imageW = 100

        let wizaFee = 0
        let finalRecipeLevel = 1
        if (finalRecipe) {
            wizaFee = (finalRecipe.wiza - (finalRecipe.wiza * discount / 100))
            if (finalRecipe.level) {
                finalRecipeLevel = finalRecipe.level
            }
        }

        return (
            <div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>

                <p style={{ fontSize: isMobile ? 15 : 17, color: mainTextColor, textAlign: 'center', marginLeft: 15, marginRight: 15, marginBottom: 15 }}>
                    Select a ring and find out what you can combine it with
                </p>

                <div style={{ width: '100%', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>

                    <button
                        className='btnH'
                        style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}
                        onClick={() => this.setState({ showModalYourRings: true, ringIdxSelected: 1, itemsInModal: this.state.yourEquip, modalForgeTitle: "Your items" })}
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
                        onClick={() => this.setState({ showModalYourRings: true, ringIdxSelected: 2, itemsInModal: this.state.selectionRing2, modalForgeTitle: "Your items" })}
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

                {
                    finalRecipeLevel && level < finalRecipeLevel ?
                    <div style={{ flexDirection: 'column', alignItems: 'center', marginTop: 35 }}>
                        <p style={{ fontSize: 15, color: mainTextColor, marginBottom: 5 }} className="text-medium">
                            Recipe Level {finalRecipeLevel}
                        </p>

                        <div
                            style={Object.assign({}, styles.btnForge, { backgroundColor: 'transparent', marginTop: 0 })}
                        >
                            <p style={{ fontSize: 15, color: mainTextColor }} className="text-medium">
                                Low Forge Level
                            </p>
                        </div>
                    </div>
                    :
                    <button
                        className='btnH'
                        style={styles.btnForge}
                        onClick={() => {
                            this.forge(wizaFee)
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                            Forge
                        </p>
                    </button>
                }
            </div>
        )
    }

    renderApForge(isMobile) {
        const { wizardSelected, itemWanted } = this.state
        const { mainTextColor, userMintedNfts } = this.props

        let imageW = 100

        //console.log(this.selectItemsToForgeFromAp());
        if (!userMintedNfts || userMintedNfts.length === 0) {
            return (
                <div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
                    <DotLoader size={25} color={mainTextColor} />
                </div>
            )
        }

        return (
            <div style={{ width: '100%', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
                <p style={{ fontSize: isMobile ? 15 : 17, color: mainTextColor, textAlign: 'center', marginLeft: 15, marginRight: 15, marginBottom: 15 }}>
                    Select the item you want to forge and a wizard with at least 48 AP
                </p>

                <div style={{ width: '100%', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 }}>

                    <button
                        className='btnH'
                        style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}
                        onClick={() => this.setState({ showModalYourRings: true, ringIdxSelected: 3, itemsInModal: this.selectItemsToForgeFromAp(), modalForgeTitle: "What to forge" })}
                    >
                        {
                            itemWanted && Object.keys(itemWanted).length > 0 ?
                            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 10 }}>
                                <img
                                    src={itemWanted.url}
                                    style={{ width: imageW, height: imageW }}
                                    alt="Ring 1"
                                />
                                <p style={{ fontSize: 15, color: mainTextColor, marginTop: 5, textAlign: 'center' }}>
                                    {itemWanted.name}
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

                    <p style={{ fontSize: 40, color: mainTextColor, marginBottom: 10 }}>
                    =
                    </p>

                    <div style={{ width: 30, height: 30 }} />

                    <button
                        className='btnH'
                        style={Object.assign({}, styles.boxImage, { cursor: 'pointer' })}
                        onClick={() => this.setState({ showChooseWizard: true })}
                    >
                        {
                            wizardSelected ?
                            <div style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', width: '100%', height: '100%', padding: 10 }}>
                                <img
                                    src={getImageUrl(wizardSelected)}
                                    style={{ width: 140, height: 140 }}
                                    alt={wizardSelected}
                                />
                                <p style={{ fontSize: 15, color: mainTextColor, marginTop: 5, textAlign: 'center' }}>
                                    48 AP from #{wizardSelected}
                                </p>
                            </div>
                            :
                            <img
                                src={getImageUrl(undefined)}
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
                            5 $KDA
                        </p>
                    </div>

                </div>

                <button
                    className='btnH'
                    style={styles.btnForge}
                    onClick={() => {
                        this.forgeWithAp()
                    }}
                >
                    <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
                        Forge
                    </p>
                </button>

            </div>
        )
    }

    renderBody(isMobile) {
        const { loading, error, forgeSection } = this.state
        const { mainTextColor } = this.props

        const { boxW, padding } = getBoxWidth(isMobile)

        return (
            <div style={{ flexDirection: 'column', width: boxW, padding, paddingTop: 30, overflowY: 'auto', overflowX: 'hidden' }}>

                <div style={{ alignItems: 'center', justifyContent: 'center', position: 'relative' }}>

                    <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 20, textAlign: 'center' }} className="text-medium">
                        Forge
                    </p>

                    <a
                        style={styles.recipeBookBtn}
                        href={`${window.location.protocol}//${window.location.host}/recipes`}
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        <img
                            src={recipe_book}
                            style={{ width: 60 }}
                            alt="Recipes Book"
                        />
                        <p style={{ fontSize: 13, color: mainTextColor, textAlign: 'center' }}>
                            Recipes Book
                        </p>
                    </a>
                </div>

                {this.renderProgressLevel()}

                {
					loading ?
					<div style={{ width: '100%', justifyContent: 'center', alignItems: 'center', paddingTop: 20, marginBottom: 30 }}>
						<DotLoader size={25} color={mainTextColor} />
					</div>
					: null
				}

                {this.renderMenu()}

                {
                    forgeSection === 1 &&
                    this.renderClassicForge(isMobile)
                }

                {
                    forgeSection === 2 &&
                    this.renderApForge(isMobile)
                }

                {
                    error &&
                    <p style={{ fontSize: 17, color: 'white' }}>
                        {error}
                    </p>
                }

                <ModalForgeEquipment
                    title={this.state.modalForgeTitle}
                    showModal={this.state.showModalYourRings}
                    onCloseModal={() => {
                         this.setState({ showModalYourRings: false })
                    }}
                    rings={this.state.itemsInModal}
                    onSelectRing={(item) => {
                        if (this.state.ringIdxSelected === 1) {
                            this.selectRing1(item)
                        }
                        else if (this.state.ringIdxSelected === 2) {
                            if (Object.keys(this.state.ring1).length === 0) {
                                this.selectRing1(item)
                            }
                            else {
                                this.selectRing2(item)
                            }
                        }
                        else if (this.state.ringIdxSelected === 3) {
                            this.setState({ showModalYourRings: false, itemWanted: item })
                        }
                    }}
                />

                <ModalChooseWizard
                    showModal={this.state.showChooseWizard}
                    onCloseModal={() => this.setState({ showChooseWizard: false })}
                    yourWizards={this.props.userMintedNfts}
                    onSelect={(id) => {
                        this.setState({ showChooseWizard: false, wizardSelected: id })
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
        marginBottom: 30,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid'
    },
    recipeBookBtn: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column',
        position: 'absolute',
        right: 10
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
    const { account, chainId, gasPrice, gasLimit, networkUrl, netId, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer

    return { account, chainId, gasPrice, gasLimit, networkUrl, netId, userMintedNfts, mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps, {
    setNetworkSettings,
    setNetworkUrl,
    loadEquipMinted,
    clearTransaction,
    getForgeLevel,
    getDiscountLevel,
    forgeItem,
    updateInfoTransactionModal,
    loadUserMintedNfts,
    forgeAp
})(Forge)
