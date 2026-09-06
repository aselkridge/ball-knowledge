#!/usr/bin/env python3
"""Tempo arithmetic for the owner's 2026-09-06 possession proposal.

Every unit cost below is an ASSUMPTION unless marked CODE (verified in
docs/play/game.js today). A beat is (label, side, taps, decisions,
seconds_practiced, seconds_first_timer, cards). Side changes are counted
as the number of times the acting side flips inside the possession; the
flip at the end is counted separately.
"""

# ---- unit costs -----------------------------------------------------------
# taps
T_FREE = 2        # off-ball free move: tap the man, tap the tile (assumption)
T_DRIBBLE = 2     # ball handler move: tap him, tap the tile (assumption; 1 if he is in hand by default)
T_CROSS = 2       # crossover: tap him, tap the priced tile (assumption)
T_PASS = 1        # receiver ring is the button (the accepted cut)
T_SHOT = 1        # SHOOT
T_ANSWER = 1      # one answer tap per card
T_INBOUND = 1     # tap the receiver
T_DEF_MOVE = 2    # tap a defender, tap a tile
T_DEF_STAY = 1    # STAY
T_STEAL = 1       # STEAL button
T_LANE = 2        # LANE button, then the lane (assumption: not built today)
T_BATTLE = 12     # reflex taps per side in the rip-or-grip tap battle (assumption)

# seconds: (practiced, first_timer)
S_FREE = (4, 8)       # decide an off-ball move
S_BALL = (4, 9)       # decide dribble / pass / crossover
S_SHOT = (3, 5)       # decide to shoot
S_CARD = (8, 12)      # answer a card; CODE max is 15
S_DEF_MOVE = (4, 7)   # decide one step
S_DEF_STAY = (2, 4)
S_LANE = (3, 5)
S_BATTLE = 5          # CODE-ish: a short buzz race
S_METER = 3           # the release meter on a contested make
S_HANDOFF = 1.5       # strip out, chime, piece slides, strip in (assumption)
S_PHONE = 2.0         # extra per side change on a shared phone (assumption)
S_FLIP = 2            # the slam at a change of possession
S_INB_COUNT = 2       # the five count before the inbound tap lands

def beat(label, side, taps, decisions, s_p, s_f, cards=0, reflex=0):
    return dict(label=label, side=side, taps=taps, dec=decisions,
                sp=s_p, sf=s_f, cards=cards, reflex=reflex)

def card(n=1):
    return (n * T_ANSWER, n * S_CARD[0], n * S_CARD[1])

# ---- beat builders (each returns one beat) --------------------------------
def O_inbound(free=False):
    t = T_INBOUND + (T_FREE if free else 0)
    d = 1 + (1 if free else 0)
    sp = S_INB_COUNT + 2 + (S_FREE[0] if free else 0)
    sf = S_INB_COUNT + 3 + (S_FREE[1] if free else 0)
    return beat('inbound' + (' + free move' if free else ''), 'O', t, d, sp, sf)

def O_turn(free, action, priced=False, blowby=None):
    """Proposal turn: optional free move + one ball action.
    action in dribble | pass | cross | shot. blowby in None | 'pass' | 'shot'."""
    t = d = sp = sf = 0
    cards = 0
    if free:
        t += T_FREE; d += 1; sp += S_FREE[0]; sf += S_FREE[1]
    if action == 'dribble':
        t += T_DRIBBLE; d += 1; sp += S_BALL[0]; sf += S_BALL[1]
    elif action == 'pass':
        t += T_PASS; d += 1; sp += S_BALL[0]; sf += S_BALL[1]
        if priced:
            a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1
    elif action == 'cross':
        t += T_CROSS; d += 1; sp += S_BALL[0]; sf += S_BALL[1]
        a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1
        if blowby == 'pass':
            t += T_PASS; d += 1; sp += 2; sf += 4
        elif blowby == 'shot':
            t += T_SHOT; d += 1; sp += S_SHOT[0]; sf += S_SHOT[1]
            a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1
    elif action == 'shot':
        t += T_SHOT; d += 1; sp += S_SHOT[0]; sf += S_SHOT[1]
        a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1
    label = ('free move + ' if free else '') + action + \
            (' (priced)' if priced else '') + \
            (' then blow-by ' + blowby if blowby else '')
    return beat(label, 'O', t, d, sp, sf, cards)

def D_turn(move='move', action=None, steal_shape='today'):
    """Defense: move or stay, plus optional action steal | lane."""
    t = d = sp = sf = 0
    cards = 0; reflex = 0
    if move == 'move':
        t += T_DEF_MOVE; d += 1; sp += S_DEF_MOVE[0]; sf += S_DEF_MOVE[1]
    else:
        t += T_DEF_STAY; d += 1; sp += S_DEF_STAY[0]; sf += S_DEF_STAY[1]
    if action == 'lane':
        t += T_LANE; d += 1; sp += S_LANE[0]; sf += S_LANE[1]
    elif action == 'steal':
        t += T_STEAL; d += 1; sp += 2; sf += 3
        a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1      # the defender's card
        if steal_shape == 'today':                                            # CODE: then the holder's card, then hands
            a, p, f = card(); t += a; d += 1; sp += p; sf += f; cards += 1
            reflex += 2 * T_BATTLE; sp += S_BATTLE; sf += S_BATTLE
    label = move + (' + ' + action if action else '')
    return beat(label, 'D', t, d, sp, sf, cards, reflex)

def contest():
    """The defender's block card inside a contested made shot (CODE: DESIGN 3b / 4)."""
    a, p, f = card()
    return beat('meter + block card', 'D', 1 + a, 1, S_METER + p, S_METER + f, 1)

# ---- possession scripts ---------------------------------------------------
def total(beats, first_timer=False, shared_phone=False):
    taps = sum(b['taps'] for b in beats)
    reflex = sum(b['reflex'] for b in beats)
    dec_o = sum(b['dec'] for b in beats if b['side'] == 'O')
    dec_d = sum(b['dec'] for b in beats if b['side'] == 'D')
    cards = sum(b['cards'] for b in beats)
    secs = sum(b['sf'] if first_timer else b['sp'] for b in beats)
    # side changes: count flips of the acting side between consecutive beats
    sides = [b['side'] for b in beats]
    changes = sum(1 for i in range(1, len(sides)) if sides[i] != sides[i - 1])
    secs += changes * S_HANDOFF + S_FLIP
    if shared_phone:
        secs += changes * S_PHONE
    o_turns = sum(1 for b in beats if b['side'] == 'O' and 'block' not in b['label'])
    d_turns = sum(1 for b in beats if b['side'] == 'D' and 'block' not in b['label'])
    return dict(taps=taps, reflex=reflex, dec_o=dec_o, dec_d=dec_d, cards=cards,
                secs=round(secs), changes=changes, o_turns=o_turns, d_turns=d_turns)

FLOWS = {}

# --- THE PROPOSAL (P): free move + ball action; defense move + optional action;
#     3 turns to cross half court, 3 after; walk-up played (no snap) ---------
FLOWS['P made basket, quick'] = [
    O_inbound(), D_turn('stay'),
    O_turn(True, 'pass'),                 # pass ahead across half court, lane clean
    D_turn('move'),
    O_turn(True, 'shot'),
]
FLOWS['P made basket, typical'] = [
    O_inbound(), D_turn('stay'),
    O_turn(True, 'dribble'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),          # crosses half court
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(True, 'cross', blowby='shot'),          # blow-by, then the shot
]
FLOWS['P made basket, typical, free move skipped twice'] = [
    O_inbound(), D_turn('stay'),
    O_turn(False, 'dribble'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(False, 'pass'), D_turn('move'),
    O_turn(True, 'cross', blowby='shot'),
]
FLOWS['P made basket, longest (cap reached)'] = [
    O_inbound(free=True), D_turn('stay'),
    O_turn(True, 'dribble'), D_turn('move'),
    O_turn(True, 'pass', priced=True), D_turn('move'),     # crosses on turn 3, pressured pass
    O_turn(True, 'pass'), D_turn('move', 'steal'),          # steal attempt, today's shape, offense holds on
    O_turn(True, 'cross', blowby='pass'), D_turn('move', 'lane'),
    O_turn(True, 'shot'), contest(),
]
FLOWS['P live steal, quick'] = [
    O_turn(True, 'dribble'),              # point guard, 3 tiles, crosses
    D_turn('move'),
    O_turn(True, 'shot'),
]
FLOWS['P live steal, typical'] = [
    O_turn(True, 'pass'), D_turn('move'),              # outlet ahead, crosses
    O_turn(True, 'dribble'), D_turn('move'),
    O_turn(True, 'shot'),
]
FLOWS['P live steal, longest (cap reached)'] = [
    O_turn(True, 'dribble'), D_turn('move'),
    O_turn(True, 'dribble'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),               # crosses on turn 3
    O_turn(True, 'pass'), D_turn('move', 'steal'),
    O_turn(True, 'cross', blowby='pass'), D_turn('move', 'lane'),
    O_turn(True, 'shot'), contest(),
]

# --- THE PROPOSAL REPAIRED: glide to the plays on a made basket (walk-up only
#     on a live ball), free move taken when wanted, one-card steal ------------
FLOWS['P repaired, made basket, typical'] = [
    O_inbound(), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(True, 'cross', blowby='shot'),
]
FLOWS['P repaired, made basket, longest (3 front-court turns)'] = [
    O_inbound(), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move', 'steal', steal_shape='onecard'),
    O_turn(True, 'cross', blowby='pass'), D_turn('move', 'lane'),
    O_turn(True, 'shot'), contest(),
]

# --- FLOW A (memo): one thing a turn; defense one step; glide to the plays on
#     a made basket (assumption: the glide lands the offense in its front court) ---
def A_turn(action, priced=False):
    return O_turn(False, action, priced)
FLOWS['A made basket, quick'] = [O_inbound(), D_turn('move'), A_turn('shot')]
FLOWS['A made basket, typical'] = [
    O_inbound(), D_turn('move'),
    A_turn('dribble'), D_turn('move'),
    A_turn('pass'), D_turn('move'),
    A_turn('shot'),
]
FLOWS['A made basket, longest (24 of offense time)'] = [
    O_inbound(), D_turn('move'),
    A_turn('dribble'), D_turn('move'),
    A_turn('pass'), D_turn('move'),
    A_turn('dribble'), D_turn('move', 'steal', steal_shape='onecard'),
    A_turn('cross'), D_turn('move'),
    A_turn('pass', priced=True), D_turn('move'),
    A_turn('shot'), contest(),
]
FLOWS['A live steal, typical'] = [
    A_turn('dribble'), D_turn('move'),
    A_turn('pass'), D_turn('move'),
    A_turn('dribble'), D_turn('move'),
    A_turn('shot'),
]

# --- FLOW B (memo): free move then pass, or shot; defense one step after ----
FLOWS['B made basket, quick'] = [O_inbound(), D_turn('move'), O_turn(False, 'shot')]
FLOWS['B made basket, typical'] = [
    O_inbound(), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(False, 'shot'),
]
FLOWS['B made basket, typical, walk-up played'] = [
    O_inbound(), D_turn('stay'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(True, 'pass'), D_turn('move'),
    O_turn(False, 'shot'),
]

# --- TODAY (shipped Method B), from the panel's description, not measured live:
#     defense picks a setup (tap card, RUN IT), offense picks seeing it, inbound,
#     up to five free moves, DONE, one slide, the action, the card ------------
FLOWS['Today, typical (panel estimate)'] = [
    beat('defense setup pick', 'D', 2, 1, 5, 9),
    beat('offense setup pick', 'O', 2, 1, 5, 9),
    O_inbound(),
    beat('five free moves + DONE', 'O', 5 * T_FREE + 1, 5, 5 * 4, 5 * 7),
    D_turn('move'),
    O_turn(False, 'cross'),
    beat('shot next turn (no slide drawn by the free step)', 'O', 0, 0, 0, 0),
]
FLOWS['Today, minus the play pick (already ruled once per quarter)'] = [
    O_inbound(),
    beat('five free moves + DONE', 'O', 5 * T_FREE + 1, 5, 5 * 4, 5 * 7),
    D_turn('move'),
    O_turn(False, 'shot'),
]

# ---- print ----------------------------------------------------------------
def row(name, r, rf, rs):
    return (f"| {name} | {r['o_turns']}+{r['d_turns']} | {r['changes']} | {r['taps']}"
            f"{' (+' + str(r['reflex']) + ' reflex)' if r['reflex'] else ''} | "
            f"{r['dec_o']} / {r['dec_d']} | {r['cards']} | {r['secs']} | {rf['secs']} | {rs['secs']} |")

print("| Possession | turns O+D | side changes | taps | decisions O / D | cards | s practiced | s first-timer | s shared phone (practiced) |")
print("|---|---|---|---|---|---|---|---|---|")
for name, beats in FLOWS.items():
    r = total(beats)
    rf = total(beats, first_timer=True)
    rs = total(beats, shared_phone=True)
    print(row(name, r, rf, rs))

# ---- the clock ceilings ----------------------------------------------------
print()
print("Clock ceilings (every clock run to zero; CODE: 24 per offensive turn, 24 per defensive step, 15 per card):")
for label, o, d, cards in [
    ('P made basket at the cap', 6, 6, 5),      # cross, pressured pass, steal x2, shot ... block card counted in cards
    ('P live steal at the cap', 6, 6, 5),
    ('A (memo: 24 for the whole offense, 8 per step, typical 4 steps, 1 card)', None, 4, 1),
]:
    if o is None:
        secs = 24 + d * 8 + cards * 15
    else:
        secs = o * 24 + d * 24 + cards * 15
    print(f"  {label}: {secs} s = {secs/60:.1f} min")
print("  Defense stalling lever under P (6 steps x 24 s, expiry costs nothing today): 144 s per possession")

# ---- the game -------------------------------------------------------------
print()
typ = total(FLOWS['P made basket, typical'])['secs']
typA = total(FLOWS['A made basket, typical'])['secs']
typB = total(FLOWS['B made basket, typical'])['secs']
typT = total(FLOWS['Today, typical (panel estimate)'])['secs']
chg = total(FLOWS['P made basket, typical'])['changes']
chgA = total(FLOWS['A made basket, typical'])['changes']
chgT = total(FLOWS['Today, typical (panel estimate)'])['changes']
print("A 24-possession game at the typical possession (practiced players, no phone passing):")
for n, s, c in [('P', typ, chg), ('A', typA, chgA), ('B', typB, total(FLOWS['B made basket, typical'])['changes']), ('Today', typT, chgT)]:
    print(f"  {n}: {24*s/60:.0f} min of play, {24*c} side changes")
print("Race to 11 (ASSUMPTION: 12 to 20 possessions, make rate 50 to 70 percent):")
for n, s in [('P', typ), ('A', typA), ('B', typB), ('Today', typT)]:
    print(f"  {n}: {12*s/60:.0f} to {20*s/60:.0f} min")
print("Shared phone, 24 possessions, 2 s per physical pass of the phone (ASSUMPTION):")
for n, c in [('P', chg), ('A', chgA), ('B', total(FLOWS['B made basket, typical'])['changes']), ('Today', chgT)]:
    print(f"  {n}: {24*c} passes, {24*c*S_PHONE/60:.1f} min of passing the phone")

# ---- where the seconds go under P typical ---------------------------------
print()
print("Where the taps and seconds go in 'P made basket, typical' (practiced):")
for b in FLOWS['P made basket, typical']:
    print(f"  {b['side']} {b['label']:<40} taps {b['taps']:>2}  s {b['sp']:>3}")
free_taps = sum(T_FREE for b in FLOWS['P made basket, typical'] if b['label'].startswith('free move'))
free_secs = sum(S_FREE[0] for b in FLOWS['P made basket, typical'] if b['label'].startswith('free move'))
print(f"  free off-ball moves alone: {free_taps} taps, {free_secs} s practiced, {free_secs*2} s first-timer")
walk = FLOWS['P made basket, typical'][:6]
w = total(walk)
print(f"  the walk-up (inbound to the crossing, 3 offense turns + 3 defense turns): {w['taps']} taps, {w['secs']-S_FLIP} s, {w['changes']} side changes")
