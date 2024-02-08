import React, { Component } from 'react';
import { connect } from 'react-redux'
import DotLoader from 'react-spinners/DotLoader';
import '../../css/Modal.css'
import cardStats from './CardStats'
import getRingBonuses from './GetRingBonuses'
import { CTA_COLOR, TEXT_SECONDARY_COLOR } from '../../actions/types'
import {
    getInfoItemEquipped,
    getInfoAura
} from '../../actions'

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
        const { medals, infoEquipment, loading } = this.state

		const classContainer = showModal ? "containerPopup" : "hidePopup"

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
}

const mapStateToProps = (state) => {
	const { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor } = state.mainReducer

	return { account, chainId, netId, gasPrice, gasLimit, networkUrl, mainTextColor, mainBackgroundColor }
}

export default connect(mapStateToProps, {
    getInfoItemEquipped,
    getInfoAura
})(ModalStats);
