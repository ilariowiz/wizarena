import React, { Component } from 'react';
import { connect } from 'react-redux'
import EquipmentCardForge from './EquipmentCardForge'
import '../../css/Modal.css'
import '../../css/ItemCard.css'
import { TEXT_SECONDARY_COLOR, BACKGROUND_COLOR, CTA_COLOR } from '../../actions/types'


class ModalForgeEquipment extends Component {
    renderItem(item, index) {

        return (
            <EquipmentCardForge
                item={item}
                key={index}
                index={index}
                onSelectRing={() => this.props.onSelectRing(item)}
            />
        )
    }

	render() {
		const { showModal, rings, mainTextColor } = this.props;

		const classContainer = showModal ? "containerPopup" : "hidePopup"

        const maxHeight = window.innerHeight * 80 / 100
        const width = window.innerWidth * 80 / 100

		return (
			<div className={classContainer}>
				<div style={Object.assign({}, styles.subcontainer, { width, maxHeight })}>

					<p style={{ color: mainTextColor, fontSize: 20, marginBottom: 20, marginTop: 20 }} className="text-medium">
						Your Rings:
					</p>

                    <div style={{ flexWrap: 'wrap', marginBottom: 20, maxHeight, overflow: 'auto', justifyContent: 'center' }}>
                        {rings.map((item, index) => {
                            return this.renderItem(item, index)
                        })}
                    </div>

                    <button
                        className='btnH'
                        style={styles.btnChoose}
                        onClick={() => {
                            this.props.onCloseModal()
                        }}
                    >
                        <p style={{ fontSize: 15, color: 'white' }} className="text-medium">
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
		backgroundColor: "white",
		borderRadius: 4,
		borderColor: "#d7d7d7",
		borderStyle: 'solid',
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexDirection: 'column',
		position: 'relative',
        paddingLeft: 15,
        paddingRight: 15
	},
    btnChoose: {
        minHeight: 40,
        height: 40,
        width: 150,
        minWidth: 100,
        marginBottom: 15,
        borderRadius: 4,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: CTA_COLOR
    },
}

const mapStateToProps = (state) => {
    const { mainTextColor } = state.mainReducer

    return { mainTextColor }
}

export default connect(mapStateToProps)(ModalForgeEquipment);
