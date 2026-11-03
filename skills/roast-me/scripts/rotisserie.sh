#!/bin/bash
# Rotisserie Chicken Animation
# A beautiful ASCII art chicken rotating on a spit inside an oven

# ── Colors ────────────────────────────────────────────────────
O='\033[38;5;208m'   # Orange (chicken body)
Y='\033[38;5;220m'   # Yellow (golden highlights)
R='\033[38;5;196m'   # Red (heating elements / fire)
B='\033[38;5;130m'   # Brown (dark roast)
G='\033[38;5;240m'   # Gray (oven frame)
W='\033[38;5;255m'   # White
C='\033[38;5;172m'   # Copper (spit rod)
D='\033[38;5;94m'    # Dark brown (drips)
N='\033[0m'          # Reset
BOLD='\033[1m'

# ── Terminal control ──────────────────────────────────────────
hide_cursor()  { printf '\033[?25l'; }
show_cursor()  { printf '\033[?25h'; }
clear_screen() { printf '\033[2J\033[H'; }
trap 'show_cursor; printf "\n"; exit' EXIT INT TERM
hide_cursor

# ── Heat shimmer characters (cycle for animation) ────────────
heat_top_a="^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^"
heat_top_b="vvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvvv"
heat_bot_a="~  .  ~  .  ~  .  ~  .  ~  .  ~  .  ~ "
heat_bot_b=".  ~  .  ~  .  ~  .  ~  .  ~  .  ~  . "

# ── Drip animation arrays ────────────────────────────────────
drip_chars=(" " "." ":" "'" " ")

# ── Frame renderer ────────────────────────────────────────────
render_frame() {
    local frame=$1
    local tick=$2

    # Alternate heat shimmer
    local ht hb
    if (( tick % 2 == 0 )); then
        ht="$heat_top_a"; hb="$heat_bot_a"
    else
        ht="$heat_top_b"; hb="$heat_bot_b"
    fi

    # Drip animation (two drip points cycling at different speeds)
    local d1="${drip_chars[$(( tick % 5 ))]}"
    local d2="${drip_chars[$(( (tick + 2) % 5 ))]}"
    local d3="${drip_chars[$(( (tick + 4) % 5 ))]}"

    # Fire flicker
    local fire_a fire_b
    if (( tick % 3 == 0 )); then
        fire_a="()()()()()()()()()()"
        fire_b=" )( )( )( )( )( )( "
    elif (( tick % 3 == 1 )); then
        fire_a=" )( )( )( )( )( )( "
        fire_b="()()()()()()()()()()"
    else
        fire_a="()() ()() ()() ()()"
        fire_b=" ()() ()() ()() () "
    fi

    clear_screen

    # ── Oven top ──────────────────────────────────────────────
    printf "${G}${BOLD}"
    printf '         ╔══════════════════════════════════════════╗\n'
    printf "         ║${R}  %s  ${G}║\n" "$fire_a"
    printf "         ║${R}  %s  ${G}║\n" "$fire_b"
    printf '         ╠══════════════════════════════════════════╣\n'
    printf "         ║${R}  %s  ${G}║\n" "$ht"
    printf '         ║                                          ║\n'

    # ── Chicken (per-frame) ───────────────────────────────────
    case $frame in
        0)  # Position 1: Breast facing viewer, legs down
            printf "         ║${O}               _.------._               ${G}║\n"
            printf "         ║${O}             .'${Y}///${O}::::${Y}\\\\\\\\${O}'.             ${G}║\n"
            printf "         ║${O}            /${Y}////${O}::::::${Y}\\\\\\\\\\\\${O}\\            ${G}║\n"
            printf "         ║${C}    ════════${O}(${Y}////${O}::::::::${Y}\\\\\\\\\\\\${O})${C}════════    ${G}║\n"
            printf "         ║${O}            \\${B}\\\\\\\\${O}::::::${B}////${O}/            ${G}║\n"
            printf "         ║${O}             '.${B}\\\\\\\\${O}::${B}////${O}.'             ${G}║\n"
            printf "         ║${O}               '-._____.-'               ${G}║\n"
            printf "         ║${B}                  /|  |\\                  ${G}║\n"
            printf "         ║${B}                 / |  | \\                 ${G}║\n"
            ;;
        1)  # Position 2: Tilting clockwise
            printf "         ║${O}                  _.---._                ${G}║\n"
            printf "         ║${O}               .'${Y}////${O}::::'.              ${G}║\n"
            printf "         ║${O}             /${Y}//////${O}::::::::\\             ${G}║\n"
            printf "         ║${C}    ════════${O}(${Y}////////${O}::::::::)${C}════════    ${G}║\n"
            printf "         ║${O}             \\${Y}//////${O}::::::::/             ${G}║\n"
            printf "         ║${O}              '.${Y}////${O}::::.'               ${G}║\n"
            printf "         ║${O}                '-.__.-'                 ${G}║\n"
            printf "         ║${B}                    /\\                    ${G}║\n"
            printf "         ║${B}                   /  \\                   ${G}║\n"
            ;;
        2)  # Position 3: Side view (legs right)
            printf "         ║${O}               _..---.._                 ${G}║\n"
            printf "         ║${O}            .'${Y}::::::::${O}'.${B}__              ${G}║\n"
            printf "         ║${O}           /${Y}::::::::::${O}\\${B}/  \\             ${G}║\n"
            printf "         ║${C}    ════════${O}(${Y}::::::::::${O}:${B}>  )${C}════════    ${G}║\n"
            printf "         ║${O}           \\${B}::::::::::${O}/${B}\\__/             ${G}║\n"
            printf "         ║${O}            '.${B}::::::::${O}.'                ${G}║\n"
            printf "         ║${O}              ''--.--''                  ${G}║\n"
            printf "         ║                                          ║\n"
            printf "         ║                                          ║\n"
            ;;
        3)  # Position 4: Upside down (legs up)
            printf "         ║${B}                 \\ |  | /                 ${G}║\n"
            printf "         ║${B}                  \\|  |/                  ${G}║\n"
            printf "         ║${O}               _.------._               ${G}║\n"
            printf "         ║${O}             .'${B}\\\\\\\\${O}::${B}////${O}'.             ${G}║\n"
            printf "         ║${C}    ════════${O}(${B}\\\\\\\\\\\\${O}::::${B}//////${O})${C}════════    ${G}║\n"
            printf "         ║${O}             \\${Y}////${O}::::::${Y}\\\\\\\\${O}/             ${G}║\n"
            printf "         ║${O}              '.${Y}///${O}::${Y}\\\\\\\\${O}.'              ${G}║\n"
            printf "         ║${O}                '-.__.-'                 ${G}║\n"
            printf "         ║                                          ║\n"
            ;;
        4)  # Position 5: Tilting counter-clockwise
            printf "         ║${O}                _.---._                  ${G}║\n"
            printf "         ║${O}              .'${B}::::${Y}\\\\\\\\${O}'.               ${G}║\n"
            printf "         ║${O}            /::::::${Y}\\\\\\\\\\\\\\\\${O}\\             ${G}║\n"
            printf "         ║${C}    ════════${O}(::::::::${Y}\\\\\\\\\\\\\\\\${O})${C}════════    ${G}║\n"
            printf "         ║${O}            \\::::::${B}////////${O}/             ${G}║\n"
            printf "         ║${O}              '.${B}:::${O}:::.'               ${G}║\n"
            printf "         ║${O}                '-.__.-'                 ${G}║\n"
            printf "         ║${B}                  /\\                      ${G}║\n"
            printf "         ║${B}                 /  \\                     ${G}║\n"
            ;;
        5)  # Position 6: Side view (legs left)
            printf "         ║${O}                 _..---.._               ${G}║\n"
            printf "         ║${B}              __${O}.'${Y}::::::::${O}'.            ${G}║\n"
            printf "         ║${B}             /  \\${O}/${Y}::::::::::${O}\\           ${G}║\n"
            printf "         ║${C}    ════════${B}(  <${O}:${Y}::::::::::${O})${C}════════    ${G}║\n"
            printf "         ║${B}             \\__/${O}\\${B}::::::::::${O}/           ${G}║\n"
            printf "         ║${O}                '.${B}::::::::${O}.'            ${G}║\n"
            printf "         ║${O}                  ''--.--''              ${G}║\n"
            printf "         ║                                          ║\n"
            printf "         ║                                          ║\n"
            ;;
    esac

    # ── Oven bottom ───────────────────────────────────────────
    printf '         ║                                          ║\n'
    printf "         ║${D}          %s        %s         %s          ${G}║\n" "$d1" "$d2" "$d3"
    printf "         ║${R}  %s ${G}║\n" "$hb"
    printf '         ╠══════════════════════════════════════════╣\n'
    printf '         ║                                          ║\n'
    printf '         ╚══════════════════════════════════════════╝\n'
    printf '              ${W}[####]                  [####]${N}\n'
    printf '\n'
    printf "${Y}${BOLD}           ~*~ R O T I S S E R I E  3 0 0 0 ~*~${N}\n"
    printf "${G}                  Press Ctrl+C to stop${N}\n"
}

# ── Main animation loop ──────────────────────────────────────
TOTAL_FRAMES=6
tick=0
cycles=20  # Run for 20 full rotations (~24 seconds)

for (( c=0; c<cycles; c++ )); do
    for (( f=0; f<TOTAL_FRAMES; f++ )); do
        render_frame $f $tick
        tick=$(( tick + 1 ))
        sleep 0.2
    done
done

# Final frame - done roasting
clear_screen
printf "${G}${BOLD}"
printf '         ╔══════════════════════════════════════════╗\n'
printf '         ║                                          ║\n'
printf "         ║${Y}${BOLD}            * * * D I N G ! * * *            ${G}║\n"
printf '         ║                                          ║\n'
printf '         ╠══════════════════════════════════════════╣\n'
printf '         ║                                          ║\n'
printf "         ║${O}               _.------._                 ${G}║\n"
printf "         ║${Y}             .'${O}**********${Y}'.               ${G}║\n"
printf "         ║${Y}            /${O}************${Y}\\              ${G}║\n"
printf "         ║${C}    ════════${Y}(${O}**************${Y})${C}════════      ${G}║\n"
printf "         ║${Y}            \\${O}************${Y}/              ${G}║\n"
printf "         ║${Y}             '.${O}**********${Y}.'               ${G}║\n"
printf "         ║${Y}               '-.____.--'                ${G}║\n"
printf "         ║${B}                  /|  |\\                   ${G}║\n"
printf "         ║${B}                 / |  | \\                  ${G}║\n"
printf '         ║                                          ║\n'
printf "         ║${Y}  ~ ~ ~ ~ PERFECTLY ROASTED ~ ~ ~ ~       ${G}║\n"
printf '         ╠══════════════════════════════════════════╣\n'
printf '         ║                                          ║\n'
printf '         ╚══════════════════════════════════════════╝\n'
printf '              ${W}[####]                  [####]${N}\n'
printf '\n'
printf "${Y}${BOLD}           ~*~ R O T I S S E R I E  3 0 0 0 ~*~${N}\n\n"

show_cursor
