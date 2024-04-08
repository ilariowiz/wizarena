import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import Popup from 'reactjs-popup';
import '../../css/Modal.css'
import cardStats from './CardStats'
import getRingBonuses from './GetRingBonuses'
import getAuraForElement from '../../assets/gifs/AuraForElement'
import { CTA_COLOR, TEXT_SECONDARY_COLOR } from '../../actions/types'
import {
    getInfoItemEquipped,
    getInfoAura
} from '../../actions'
import 'reactjs-popup/dist/index.css';


class ModalStats extends Component {
    constructor(props) {
        super(props)

        this.state = {
            loading: true,
            ring: {},
            pendant: {},
            aura: {},
            infoEquipment: {},
            medals: 0
        }
    }

    componentDidMount() {
        this.loadAllInfo()
    }

    async loadAllInfo() {
        const { chainId, gasPrice, gasLimit, networkUrl, item } = this.props

        const ring = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, item.id)

        const pendant = await this.props.getInfoItemEquipped(chainId, gasPrice, gasLimit, networkUrl, `${item.id}pendant`)

        const aura = await this.props.getInfoAura(chainId, gasPrice, gasLimit, networkUrl, item.id)

        //console.log(ring, pendant, aura);

        let infoEquipment;
		if (ring) {
			infoEquipment = getRingBonuses(ring)
            //console.log(infoEquipment);
		}

        if (aura && aura.bonus.int > 0) {
            if (infoEquipment) {
                infoEquipment.bonusesText.push(`+${aura.bonus.int} Aura defense`)
                if (infoEquipment.bonusesDict['defense']) {
                    infoEquipment.bonusesDict['defense'] += aura.bonus.int
                }
                else {
                    infoEquipment.bonusesDict['defense'] = aura.bonus.int
                }
            }
            else {
                infoEquipment.bonusesText = [`+${aura.bonus.int} Aura defense`]
                infoEquipment.bonusesDict = {}
                infoEquipment['defense'] = aura.bonus.int
            }
        }

        //console.log(infoEquipment);

        const medals = this.calcMedals()

        this.setState({ ring, pendant, aura, infoEquipment, medals, loading: false })
    }

    calcMedals() {
        const { item } = this.props

        const medals = item.medals

        let tot = 0

        Object.keys(medals).forEach(i => {
            tot += parseInt(medals[i])
        })

        return tot
    }


	render() {
		const { showModal, onCloseModal, item, mainTextColor, mainBackgroundColor } = this.props;
        const { medals, infoEquipment, loading, ring, aura, pendant } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        //console.log(ring, pendant, aura);

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { backgroundColor: mainBackgroundColor })}>

                    <p style={{ fontSize: 18, color: mainTextColor, marginTop: 20, marginBottom: 20 }}>
                        #{item.id}
                    </p>

                    <div style={{ width: '100%' }}>
                        {
                            loading ?
                            <div style={{ width: '100%', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                                <DotLoader size={25} color={TEXT_SECONDARY_COLOR} />

                                <p style={{ marginTop: 10, color: mainTextColor, fontSize: 15 }}>
                                    Loading equipment...
                                </p>
                            </div>
                            :
                            cardStats(item, medals, '90%', infoEquipment ? infoEquipment.bonusesDict : undefined, mainTextColor)
                        }
                    </div>

                    <div style={{ alignItems: 'center' }}>
                        {
                            ring && ring.equipped ?
                            <Popup
        						trigger={open => (
                                    <img
                                        style={styles.imgEquip}
                                        src={ring.url}
                                        alt="Ring"
                                    />
        						)}
        						position="top center"
        						on="hover"
        					>
                                <p style={{ color: "black", fontSize: 16 }}>
                                    {ring.name}
                                </p>
        					</Popup>
                            : null
                        }

                        {
                            pendant && pendant.equipped ?
                            <Popup
        						trigger={open => (
                                    <img
                                        style={styles.imgEquip}
                                        src={pendant.url}
                                        alt="Pendant"
                                    />
        						)}
        						position="top center"
        						on="hover"
        					>
                                <p style={{ color: "black", fontSize: 16 }}>
                                    {pendant.name}
                                </p>
        					</Popup>
                            : null
                        }

                        {
                            aura && aura.bonus && aura.bonus.int > 0 ?
                            <Popup
        						trigger={open => (
                                    <img
                                        style={styles.imgEquip}
                                        src={getAuraForElement(item.element)}
                                        alt="Aura"
                                    />
        						)}
        						position="top center"
        						on="hover"
        					>
                                <p style={{ color: "black", fontSize: 16 }}>
                                    Aura of Defense +{aura.bonus.int}
                                </p>
        					</Popup>
                            : null
                        }

                    </div>

                    <button
                        style={Object.assign({}, styles.btnSub, { width: '90%' })}
                        onClick={onCloseModal}
                    >
                        <p style={{ color: 'white', fontSize: 15 }} className="text-medium">
                            Close
                        </p>
                    </button>

				</div>
			</div>
		)
	}
}


const styles = {
	subcontainer: {
		minHeight: 300,
        minWidth: 250,
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative'
	},
    btnSub: {
		height: 30,
		backgroundColor: CTA_COLOR,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 4,
        marginTop: 20,
        marginBottom: 20
    },
    imgEquip: {
        marginLeft: 10,
        marginRight: 10,
        width: 40,
        borderRadius: 4,
        borderWidth: 1,
        borderColor: TEXT_SECONDARY_COLOR,
        borderStyle: 'solid'
    }
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps, {
    getInfoItemEquipped,
    getInfoAura
})(ModalStats);
