import SPELLS from 'common/SPELLS';
import { SpellLink } from 'interface';
import Analyzer, { SELECTED_PLAYER } from 'parser/core/Analyzer';
import EventGrouper from 'parser/core/EventGrouper';
import Events from 'parser/core/Events';
import BoringSpellValue from 'parser/ui/BoringSpellValue';
import Statistic from 'parser/ui/Statistic';
import STATISTIC_ORDER from 'parser/ui/STATISTIC_ORDER';

const PENANCE_MINIMUM_RECAST_TIME = 3500; // Minimum duration from one Penance to Another

class Penance extends Analyzer {
  get missedBolts() {
    return [...this.eventGrouper].reduce(
      (missedBolts, cast) => missedBolts + (this._boltCount - cast.length),
      0,
    );
  }

  get casts() {
    return [...this.eventGrouper].length;
  }

  get currentBoltNumber() {
    return [...this.eventGrouper].slice(-1)[0].length - 1; // -1 here for legacy code
  }

  _boltCount = 3;
  hits = 0;
  eventGrouper = new EventGrouper(PENANCE_MINIMUM_RECAST_TIME);

  constructor(options) {
    super(options);

    // Castigation Penance bolt count to 4 (from 3)
    this._boltCount = this.selectedCombatant.hasTalent(SPELLS.CASTIGATION_TALENT.id) ? 4 : 3;
    this.addEventListener(Events.damage.by(SELECTED_PLAYER), this.onDamage);
    this.addEventListener(Events.heal.by(SELECTED_PLAYER), this.onHeal);
  }

  static isPenance = (spellId) =>
    spellId === SPELLS.PENANCE.id ||
    spellId === SPELLS.PENANCE_HEAL.id ||
    spellId === SPELLS.PENANCE_CAST.id;

  onDamage(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    this.eventGrouper.processEvent(event);

    event.penanceBoltNumber = this.currentBoltNumber;
  }

  onHeal(event) {
    if (!Penance.isPenance(event.ability.guid)) {
      return;
    }

    this.eventGrouper.processEvent(event);

    event.penanceBoltNumber = this.currentBoltNumber;
  }

  statistic() {
    return (
      <Statistic
        position={STATISTIC_ORDER.CORE(13)}
        size="small"
        tooltip={
          <>
            Each <SpellLink id={SPELLS.PENANCE.id} /> cast has 3 bolts (4 if you're using{' '}
            <SpellLink id={SPELLS.CASTIGATION_TALENT.id} />
            ). You should try to let this channel finish as much as possible. You channeled Penance{' '}
            {this.casts} times.
          </>
        }
      >
        <BoringSpellValue
          spellId={SPELLS.PENANCE.id}
          value={this.missedBolts}
          label={
            <>
              Wasted <SpellLink id={SPELLS.PENANCE.id} /> bolts
            </>
          }
        />
      </Statistic>
    );
  }
}

export default Penance;
