import React, { Component } from 'react'
import { connect } from 'react-redux'
import Media from 'react-media';
import Header from './Header'
import recipeBook from './common/RecipeBook'
import getBoxWidth from './common/GetBoxW'
import { CTA_COLOR } from '../actions/types'
import {
    setNetworkUrl,
    setNetworkSettings,
    loadEquipMinted,
    loadUserMintedNfts,
    setSfidaPvE
} from '../actions'


class Recipes extends Component {
    constructor(props) {
        super(props)

        let capitoli = {}
        recipeBook.map(i => {
            if (!capitoli[i.stat]) {
                capitoli[i.stat] = []
            }

            capitoli[i.stat].push(i)
        })

        //console.log(capitoli);

        this.state = {
            capitoli,
            capitoloSelected: 'HP'
        }
    }

    componentDidMount() {
		document.title = "Recipes - Wizards Arena"

        /*
        const baseUrl = "https://storage.googleapis.com/wizarena/equipment/"
        const elements = [
            {name: "Pendant of Fire Resistance (medium)", type: "fire", url: `${baseUrl}pendant_fire_res_m.png`},
            {name: "Pendant of Acid Resistance (medium)", type: "acid", url: `${baseUrl}pendant_acid_res_m.png`},
            {name: "Pendant of Dark Resistance (medium)", type: "dark", url: `${baseUrl}pendant_acid_dark_m.png`},
            {name: "Pendant of Earth Resistance (medium)", type: "earth", url: `${baseUrl}pendant_earth_res_m.png`},
            {name: "Pendant of Ice Resistance (medium)", type: "ice", url: `${baseUrl}pendant_ice_res_m.png`},
            {name: "Pendant of Psycho Resistance (medium)", type: "psycho", url: `${baseUrl}pendant_psycho_res_m.png`},
            {name: "Pendant of Spirit Resistance (medium)", type: "spirit", url: `${baseUrl}pendant_spirit_res_m.png`},
            {name: "Pendant of Sun Resistance (medium)", type: "sun", url: `${baseUrl}pendant_sun_res_m.png`},
            {name: "Pendant of Thunder Resistance (medium)", type: "thunder", url: `${baseUrl}pendant_thunder_res_m.png`},
            {name: "Pendant of Undead Resistance (medium)", type: "undead", url: `${baseUrl}pendant_undead_res_m.png`},
            {name: "Pendant of Water Resistance (medium)", type: "water", url: `${baseUrl}pendant_water_res_m.png`},
            {name: "Pendant of Wind Resistance (medium)", type: "wind", url: `${baseUrl}pendant_wind_res_m.png`},
        ]
        const stat = "Element Resistance (Medium)"

        let temp = []
        for (var i = 0; i < elements.length; i++) {
            const e = elements[i]

            temp.push({
                "ingredients": `ap_to_${e.type}`,
                "ingredientsInfo": [{"url": "https://storage.googleapis.com/wizarena/placeholder.png", "name": "45 AP"}],
                "name": e.name,
                "url": e.url,
                "wiza": 0,
                "kda": 5,
                "stat": stat,
                "level": 1
            })
        }

        console.log( temp);
        */
	}

    renderCapitolo(item, index) {
        const { mainTextColor, isDarkmode } = this.props
        const { capitoloSelected } = this.state


        return (
            <button
                key={index}
                style={Object.assign({}, styles.btnCapitolo, { backgroundColor: item === capitoloSelected ? CTA_COLOR : 'transparent' })}
                onClick={() => this.setState({ capitoloSelected: item })}
            >
                <p style={{ fontSize: 15, color: isDarkmode ? 'white' : mainTextColor }} className="text-medium">
                    {item}
                </p>
            </button>
        )
    }

    renderRicetta(item, index) {
        const { mainTextColor } = this.props

        let level = 1
        if (item.level) {
            level = item.level
        }

        return (
            <div style={styles.card} key={index}>
                <img
                    src={item.url}
                    style={{ width: 90, height: 90, marginBottom: 5 }}
                    alt='result'
                />
                <p style={{ fontSize: 16, color: mainTextColor, textAlign: 'center', marginBottom: 15 }} className="text-bold">
                    {item.name}
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                    FORGE LEVEL: {level}
                </p>

                <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 15 }}>
                    INGREDIENTS:
                </p>

                {
                    item.wiza > 0 &&
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                        1) {item.wiza} $WIZA
                    </p>
                }

                {
                    item.kda &&
                    <p style={{ fontSize: 16, color: mainTextColor, marginBottom: 5 }}>
                        1) {item.kda} $KDA
                    </p>
                }

                <div style={{ alignItems: 'center' }}>
                    <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginRight: 10 }}>
                        <img
                            src={item.ingredientsInfo[0].url}
                            style={{ width: 60 }}
                            alt='ingredient'
                        />
                        <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }}>
                            2) {item.ingredientsInfo[0].name}
                        </p>
                    </div>

                    {
                        item.ingredientsInfo.length > 1 &&
                        <div style={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                            <img
                                src={item.ingredientsInfo[1].url}
                                style={{ width: 60 }}
                                alt='ingredient'
                            />
                            <p style={{ fontSize: 14, color: mainTextColor, textAlign: 'center' }}>
                                3) {item.ingredientsInfo[1].name}
                            </p>
                        </div>
                    }
                </div>
            </div>
        )
    }

    renderBody(isMobile) {
        const { capitoli, capitoloSelected } = this.state
        const { mainTextColor } = this.props

        let { boxW, padding } = getBoxWidth(isMobile)

        if (boxW > 1000) {
            boxW = 1000
        }

        return (
            <div style={{ justifyContent: 'center', overflowY: 'auto', overflowX: 'hidden' }}>
                <div style={{ flexDirection: 'column', alignItems: 'center', width: boxW, padding, paddingTop: 30 }}>

                    <p style={{ color: mainTextColor, fontSize: 24, marginBottom: 25 }} className="text-medium">
                        Recipes Book
                    </p>

                    <div style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'flex-start', alignItems: 'flex-start' }}>

                        <div style={{ flexDirection: isMobile ? 'row' : 'column', flexWrap: 'wrap' }}>
                            {Object.keys(capitoli).map((item, index) => {
                                return this.renderCapitolo(item, index)
                            })}
                        </div>

                        <div style={{ flexWrap: 'wrap' }}>
                            {capitoli[capitoloSelected].map((item, index) => {
                                return this.renderRicetta(item, index)
                            })}
                        </div>


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
    btnCapitolo: {
        borderRadius: 4,
        width: 160,
        height: 40,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
        marginRight: 15,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid'
    },
    boxRicetta: {
        borderRadius: 4,
        borderColor: CTA_COLOR,
        borderWidth: 1,
        borderStyle: 'solid',
        alignItems: 'center',
        padding: 8,
        marginBottom: 15
    },
    card: {
        width: 210,
        flexDirection: 'column',
        alignItems: 'center',
        padding: 10,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: CTA_COLOR,
        borderStyle: 'solid',
        marginRight: 10,
        marginLeft: 10,
        marginBottom: 20,
        //height: 'fit-content'
    },
}

const mapStateToProps = (state) => {
    const { mainTextColor, mainBackgroundColor, isDarkmode } = state.mainReducer

    return { mainTextColor, mainBackgroundColor, isDarkmode }
}

export default connect(mapStateToProps, {
    setNetworkUrl,
    setNetworkSettings,
    loadEquipMinted,
    loadUserMintedNfts,
    setSfidaPvE
})(Recipes)
